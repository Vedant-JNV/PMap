import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet.heat';
import { Issue, getCategoryInfo, IssueCategory } from '@/types/issues';

// Category priority weights (higher = more heat contribution)
const CATEGORY_HEAT_WEIGHTS: Record<IssueCategory, number> = {
  safety: 2.0,
  water: 1.8,
  roads: 1.5,
  garbage: 1.3,
  traffic: 1.2,
  lighting: 1.0,
  other: 0.8,
};

// Maximum weight cap to prevent one area from dominating
const MAX_HEAT_WEIGHT = 1.0;
const MIN_HEAT_WEIGHT = 0.1;

// Time decay configuration
const DAYS_FOR_FULL_DECAY = 365 * 10; // 10 years for complete decay (intensity → 0)
const HALF_LIFE_DAYS = 180; // Issues lose half their intensity after 6 months

/**
 * Calculate time decay factor based on issue age
 * Returns 0-1, where 1 is brand new and 0 is 10+ years old
 */
const calculateTimeDecay = (lastUpdated: Date): number => {
  const now = new Date();
  const ageInMs = now.getTime() - new Date(lastUpdated).getTime();
  const ageInDays = ageInMs / (1000 * 60 * 60 * 24);
  
  // Complete decay after 10 years
  if (ageInDays >= DAYS_FOR_FULL_DECAY) {
    return 0;
  }
  
  // Exponential decay with half-life
  // Formula: decay = 0.5^(age/half_life)
  const decayFactor = Math.pow(0.5, ageInDays / HALF_LIFE_DAYS);
  
  // Ensure minimum of 0 for very old issues
  return Math.max(0, Math.min(1, decayFactor));
};

/**
 * Calculate normalized heat weight for an issue
 * Considers: report count, category weight, and time decay
 */
const calculateHeatWeight = (issue: Issue, maxReportCount: number): number => {
  // Normalize report count (0-1 scale)
  const normalizedReportCount = maxReportCount > 0 
    ? Math.log1p(issue.reportCount) / Math.log1p(maxReportCount) 
    : 0.5;
  
  // Get category weight
  const categoryWeight = CATEGORY_HEAT_WEIGHTS[issue.category] || 1.0;
  
  // Get time decay factor
  const timeDecay = calculateTimeDecay(issue.lastUpdated);
  
  // If time decay is 0 (10+ years old), return 0
  if (timeDecay === 0) {
    return 0;
  }
  
  // Combined weight: normalized reports × category × time decay
  const rawWeight = normalizedReportCount * categoryWeight * timeDecay;
  
  // Cap the weight to prevent domination
  const cappedWeight = Math.min(rawWeight, MAX_HEAT_WEIGHT);
  
  // Ensure minimum visibility for active issues
  return Math.max(cappedWeight, MIN_HEAT_WEIGHT * timeDecay);
};

interface CivicMapProps {
  issues: Issue[];
  showHeatmap: boolean;
  onIssueClick: (issue: Issue) => void;
  onMapClick: (lat: number, lng: number) => void;
}

// Zoom level at which markers appear in heatmap mode
const MARKER_ZOOM_THRESHOLD = 13;

// Dynamic radius based on zoom level
const getHeatmapRadius = (zoom: number): number => {
  if (zoom >= 16) return 52;
  if (zoom >= 14) return 47;
  if (zoom >= 12) return 42;
  return 37;
};

const CivicMap = ({ issues, showHeatmap, onIssueClick, onMapClick }: CivicMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const heatLayerRef = useRef<L.HeatLayer | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(13);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Default center (New Delhi, India)
    const defaultCenter: L.LatLngExpression = [28.6139, 77.2090];

    mapRef.current = L.map(mapContainer.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: false,
    });

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    // OpenStreetMap tiles (free, no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Initialize marker cluster group
    markersRef.current = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = 'small';
        if (count > 10) size = 'medium';
        if (count > 25) size = 'large';
        
        return L.divIcon({
          html: `<div class="cluster-icon cluster-${size}">${count}</div>`,
          className: 'custom-cluster',
          iconSize: L.point(40, 40),
        });
      },
    });

    mapRef.current.addLayer(markersRef.current);

    // Handle map clicks for new issue submission
    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    // Track zoom level changes
    mapRef.current.on('zoomend', () => {
      if (mapRef.current) {
        setZoomLevel(mapRef.current.getZoom());
      }
    });

    setMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onMapClick]);

  // Update markers and heatmap when issues or view mode changes
  useEffect(() => {
    if (!mapRef.current || !markersRef.current || !mapReady) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Remove existing heatmap
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (showHeatmap) {
      // Find max report count for normalization
      const maxReportCount = Math.max(...issues.map(i => i.reportCount), 1);
      
      // Create heatmap data with normalized, time-decayed, category-weighted intensity
      const heatData: [number, number, number][] = issues
        .map(issue => {
          const weight = calculateHeatWeight(issue, maxReportCount);
          return [issue.lat, issue.lng, weight] as [number, number, number];
        })
        .filter(([, , weight]) => weight > 0); // Exclude completely decayed issues

      if (heatData.length > 0) {
        heatLayerRef.current = L.heatLayer(heatData, {
          radius: getHeatmapRadius(zoomLevel), // Dynamic radius based on zoom
          blur: 20, // Less blur for more defined hotspots
          maxZoom: 17,
          max: MAX_HEAT_WEIGHT, // Use our cap as the max
          minOpacity: 0.3,
          gradient: {
            0.0: '#10b981', // emerald - low
            0.15: '#22c55e', // green
            0.3: '#84cc16', // lime
            0.45: '#eab308', // yellow - medium
            0.6: '#f97316', // orange
            0.75: '#ef4444', // red - high
            0.9: '#dc2626', // dark red
            1.0: '#b91c1c', // darker red - very high
          },
        });
        heatLayerRef.current.addTo(mapRef.current);
      }

      // Show markers only when zoomed in close enough in heatmap mode
      if (zoomLevel >= MARKER_ZOOM_THRESHOLD) {
        addMarkersToMap(issues);
      }
    } else {
      // Always show markers when NOT in heatmap mode
      addMarkersToMap(issues);
    }

  }, [issues, showHeatmap, onIssueClick, mapReady, zoomLevel]);

  const addMarkersToMap = (issuesToAdd: Issue[]) => {
    issuesToAdd.forEach(issue => {
      const categoryInfo = getCategoryInfo(issue.category);
      
      const marker = L.marker([issue.lat, issue.lng], {
        icon: L.divIcon({
          html: `
            <div class="issue-marker" style="background-color: ${categoryInfo.color}">
              <span class="marker-icon">${categoryInfo.icon}</span>
              ${issue.reportCount > 1 ? `<span class="marker-count">${issue.reportCount}</span>` : ''}
            </div>
          `,
          className: 'custom-marker',
          iconSize: L.point(36, 36),
          iconAnchor: L.point(18, 18),
        }),
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onIssueClick(issue);
      });

      markersRef.current?.addLayer(marker);
    });
  };

  return (
    <div ref={mapContainer} className="absolute inset-0 z-0" />
  );
};

export default CivicMap;
