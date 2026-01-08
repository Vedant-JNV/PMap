import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet.heat';
import { Issue, getCategoryInfo } from '@/types/issues';

interface CivicMapProps {
  issues: Issue[];
  showHeatmap: boolean;
  onIssueClick: (issue: Issue) => void;
  onMapClick: (lat: number, lng: number) => void;
}

// Zoom level at which markers appear in heatmap mode
const MARKER_ZOOM_THRESHOLD = 16;

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

    // Default center (San Francisco)
    const defaultCenter: L.LatLngExpression = [37.7749, -122.4194];

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
      // Create heatmap data with severity-based intensity - enhanced visibility
      const heatData: [number, number, number][] = issues.map(issue => [
        issue.lat,
        issue.lng,
        (issue.severity / 5) + 0.5, // Higher base intensity for visibility
      ]);

      if (heatData.length > 0) {
        heatLayerRef.current = L.heatLayer(heatData, {
          radius: 60, // Much larger radius
          blur: 35, // More blur for smooth gradients
          maxZoom: 17,
          max: 2,
          minOpacity: 0.4, // More visible minimum opacity
          gradient: {
            0.1: '#10b981', // emerald
            0.25: '#22c55e', // green
            0.4: '#eab308', // yellow
            0.55: '#f97316', // orange
            0.7: '#ef4444', // red
            0.85: '#dc2626', // dark red
            1.0: '#991b1b', // very dark red
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
