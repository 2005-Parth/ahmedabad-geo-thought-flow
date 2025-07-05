
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapLayer } from '@/types/workflow';

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  layers: MapLayer[];
  onLayerClick?: (layer: MapLayer, coordinates: [number, number]) => void;
}

const MapView: React.FC<MapViewProps> = ({ layers, onLayerClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layerGroups = useRef<Record<string, L.LayerGroup>>({});

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Ahmedabad coordinates
    const ahmedabadCenter: [number, number] = [23.0225, 72.5714];

    map.current = L.map(mapContainer.current, {
      center: ahmedabadCenter,
      zoom: 11,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Add custom zoom control
    map.current.zoomControl.setPosition('topright');

    // Add some sample data for demonstration
    addSampleAhmedabadData();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add sample Ahmedabad geospatial data
  const addSampleAhmedabadData = () => {
    if (!map.current) return;

    // Sample flood-prone areas (simplified polygons)
    const floodZones = [
      {
        coords: [[23.0400, 72.5500], [23.0450, 72.5600], [23.0350, 72.5650], [23.0300, 72.5550]],
        name: 'Sabarmati Riverbank - High Risk'
      },
      {
        coords: [[23.0100, 72.5800], [23.0150, 72.5900], [23.0050, 72.5950], [23.0000, 72.5850]],
        name: 'Kankaria Area - Medium Risk'
      }
    ];

    // Sample parks and green spaces
    const greenSpaces = [
      { coords: [23.0076, 72.5898], name: 'Kankaria Lake', radius: 500 },
      { coords: [23.0324, 72.5581], name: 'Sabarmati Riverfront', radius: 300 },
      { coords: [22.9916, 72.6161], name: 'Vastrapur Lake', radius: 200 },
    ];

    // Add flood zones
    floodZones.forEach((zone, index) => {
      const polygon = L.polygon(zone.coords as L.LatLngTuple[], {
        color: '#dc2626',
        fillColor: '#fecaca',
        fillOpacity: 0.5,
        weight: 2
      }).addTo(map.current!);

      polygon.bindPopup(`<strong>${zone.name}</strong><br/>Flood Risk Zone`);
    });

    // Add green spaces
    greenSpaces.forEach((space, index) => {
      const circle = L.circle(space.coords as L.LatLngTuple, {
        color: '#16a34a',
        fillColor: '#bbf7d0',
        fillOpacity: 0.6,
        radius: space.radius,
        weight: 2
      }).addTo(map.current!);

      circle.bindPopup(`<strong>${space.name}</strong><br/>Green Space / Recreation Area`);
    });

    // Add city boundary marker
    const cityCenter = L.marker([23.0225, 72.5714]).addTo(map.current!);
    cityCenter.bindPopup('<strong>Ahmedabad City Center</strong><br/>Heritage City of India');
  };

  // Update layers when props change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing layer groups
    Object.values(layerGroups.current).forEach(group => {
      map.current!.removeLayer(group);
    });
    layerGroups.current = {};

    // Add new layers
    layers.forEach(layer => {
      if (!layer.visible) return;

      const layerGroup = new L.LayerGroup();
      
      // Add layer data based on type
      if (layer.data && layer.data.features) {
        layer.data.features.forEach((feature: any) => {
          const geoJsonLayer = L.geoJSON(feature, {
            style: {
              color: layer.color,
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.5
            }
          });
          
          if (onLayerClick) {
            geoJsonLayer.on('click', (e) => {
              onLayerClick(layer, [e.latlng.lat, e.latlng.lng]);
            });
          }

          layerGroup.addLayer(geoJsonLayer);
        });
      }

      layerGroups.current[layer.id] = layerGroup;
      map.current!.addLayer(layerGroup);
    });
  }, [layers, onLayerClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" />
      
      {/* Map overlay with legend */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
        <h3 className="font-semibold text-sm mb-2 text-gray-800">Ahmedabad Geospatial Analysis</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-200 border-2 border-red-600 rounded"></div>
            <span>Flood Risk Zones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-200 border-2 border-green-600 rounded-full"></div>
            <span>Green Spaces</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>City Center</span>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-[1000]">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-subtle"></div>
          <span>Map Ready</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
