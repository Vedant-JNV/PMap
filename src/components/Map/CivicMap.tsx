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

const CivicMap = ({ issues, showHeatmap, onIssueClick, onMapClick }: CivicMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const heatLayerRef = useRef<L.HeatLayer | null>(null);
  const [mapReady, setMapReady] = useState(false);

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
      // Create heatmap data with severity-based intensity
      const heatData: [number, number, number][] = issues.map(issue => [
        issue.lat,
        issue.lng,
        issue.severity / 10, // Normalize intensity
      ]);

      if (heatData.length > 0) {
        heatLayerRef.current = L.heatLayer(heatData, {
          radius: 35,
          blur: 25,
          maxZoom: 15,
          max: 3,
          gradient: {
            0.2: '#22c55e',
            0.4: '#eab308',
            0.6: '#f97316',
            0.8: '#ef4444',
            1.0: '#dc2626',
          },
        });
        heatLayerRef.current.addTo(mapRef.current);
      }
    }

    // Always add markers (visible through heatmap or standalone)
    issues.forEach(issue => {
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

  }, [issues, showHeatmap, onIssueClick, mapReady]);

  return (
    <div ref={mapContainer} className="absolute inset-0 z-0" />
  );
};

export default CivicMap;
