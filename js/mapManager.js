// js/mapManager.js
// Map initialization and management

import { MAP_CONFIG, TILE_LAYERS } from './config.js';

// Global map and layer references
let map = null;
let layerGroups = {};
let baseLayers = {};
let layerControl = null;

// Initialize map and base layers
export function initializeMap() {
    try {
        // Initialize map centered on Driftless Region
        map = L.map('map').setView(MAP_CONFIG.center, MAP_CONFIG.defaultZoom);

        // Add base layers
        baseLayers = createBaseLayers();
        
        // Start with OpenStreetMap
        baseLayers.osm.addTo(map);
        
        // Add layer control
        layerControl = L.control.layers(baseLayers).addTo(map);
        
        // Initialize layer groups with enhanced configuration
        layerGroups = {
            prairieLayer: L.layerGroup(),
            connectivityLayer: L.layerGroup(),
            speciesLayer: L.layerGroup(),
            habitatLayer: L.layerGroup(),
            priorityLayer: L.layerGroup()
        };

        // Add map event listeners
        setupMapEventListeners();
        
        console.log('Map initialized successfully');
        return map;
    } catch (error) {
        console.error('Error initializing map:', error);
        throw error;
    }
}

// Create base tile layers
function createBaseLayers() {
    try {
        const osm = L.tileLayer(TILE_LAYERS.osm.url, {
            attribution: TILE_LAYERS.osm.attribution,
            maxZoom: 18
        });

        const satellite = L.tileLayer(TILE_LAYERS.satellite.url, {
            attribution: TILE_LAYERS.satellite.attribution,
            maxZoom: 18
        });

        const topo = L.tileLayer(TILE_LAYERS.topo.url, {
            attribution: TILE_LAYERS.topo.attribution,
            maxZoom: 18
        });

        return {
            "OpenStreetMap": osm,
            "Satellite": satellite,
            "Topographic": topo,
            osm: osm,
            satellite: satellite,
            topo: topo
        };
    } catch (error) {
        console.error('Error creating base layers:', error);
        // Return minimal fallback
        return {
            "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            })
        };
    }
}

// Setup map event listeners
function setupMapEventListeners() {
    if (!map) return;

    // Map ready event
    map.on('load', () => {
        console.log('Map loaded and ready');
    });

    // Zoom change tracking
    map.on('zoomend', () => {
        const zoom = map.getZoom();
        console.log(`Map zoom changed to: ${zoom}`);
        
        // Adjust marker sizes based on zoom level if needed
        adjustMarkersForZoom(zoom);
    });

    // Bounds change tracking for performance optimization
    map.on('moveend', () => {
        const bounds = map.getBounds();
        console.log('Map bounds changed:', bounds.toString());
    });

    // Click event for debugging
    map.on('click', (e) => {
        console.log(`Map clicked at: ${e.latlng.lat}, ${e.latlng.lng}`);
    });
}

// Adjust marker visibility/size based on zoom level
function adjustMarkersForZoom(zoom) {
    // This could be used to optimize performance at different zoom levels
    // For now, just log the zoom level
    if (zoom < 10) {
        // Could hide small markers or cluster them
    } else if (zoom > 15) {
        // Could show more detail
    }
}

// Enhanced layer management functions
export function addLayer(layerName, options = {}) {
    if (layerGroups[layerName] && map) {
        map.addLayer(layerGroups[layerName]);
        
        if (options.fitBounds && layerGroups[layerName].getLayers().length > 0) {
            fitToLayerBounds(layerName);
        }
        
        console.log(`Added layer: ${layerName}`);
        return true;
    } else {
        console.warn(`Layer ${layerName} not found or map not initialized`);
        return false;
    }
}

export function removeLayer(layerName) {
    if (layerGroups[layerName] && map) {
        map.removeLayer(layerGroups[layerName]);
        console.log(`Removed layer: ${layerName}`);
        return true;
    } else {
        console.warn(`Layer ${layerName} not found or map not initialized`);
        return false;
    }
}

export function clearLayer(layerName) {
    if (layerGroups[layerName]) {
        layerGroups[layerName].clearLayers();
        console.log(`Cleared layer: ${layerName}`);
        return true;
    } else {
        console.warn(`Layer ${layerName} not found`);
        return false;
    }
}

export function toggleLayer(layerName) {
    if (!layerGroups[layerName] || !map) {
        console.warn(`Layer ${layerName} not found or map not initialized`);
        return false;
    }

    if (map.hasLayer(layerGroups[layerName])) {
        removeLayer(layerName);
        return false; // Layer is now off
    } else {
        addLayer(layerName);
        return true; // Layer is now on
    }
}

// Layer state management
export function getLayerVisibility() {
    const visibility = {};
    Object.keys(layerGroups).forEach(layerName => {
        visibility[layerName] = map && map.hasLayer(layerGroups[layerName]);
    });
    return visibility;
}

export function setLayerVisibility(layerStates) {
    Object.entries(layerStates).forEach(([layerName, visible]) => {
        if (visible) {
            addLayer(layerName);
        } else {
            removeLayer(layerName);
        }
    });
}

// Enhanced map utility functions
export function fitToBounds(bounds, options = {}) {
    if (map && bounds) {
        const defaultOptions = {
            padding: [20, 20],
            maxZoom: 16
        };
        map.fitBounds(bounds, { ...defaultOptions, ...options });
        return true;
    }
    return false;
}

export function fitToLayerBounds(layerName, options = {}) {
    if (layerGroups[layerName] && layerGroups[layerName].getLayers().length > 0) {
        const group = L.featureGroup(layerGroups[layerName].getLayers());
        const bounds = group.getBounds();
        return fitToBounds(bounds, options);
    }
    return false;
}

export function fitToAllVisibleLayers() {
    const visibleLayers = [];
    Object.entries(layerGroups).forEach(([name, layer]) => {
        if (map && map.hasLayer(layer)) {
            visibleLayers.push(...layer.getLayers());
        }
    });

    if (visibleLayers.length > 0) {
        const group = L.featureGroup(visibleLayers);
        const bounds = group.getBounds();
        return fitToBounds(bounds);
    }
    return false;
}

export function setView(center, zoom, options = {}) {
    if (map) {
        map.setView(center, zoom, options);
        return true;
    }
    return false;
}

// Data-specific utility functions
export function calculateDataBounds(data) {
    if (!data || data.length === 0) return null;

    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    data.forEach(item => {
        if (item.lat && item.lng) {
            minLat = Math.min(minLat, item.lat);
            maxLat = Math.max(maxLat, item.lat);
            minLng = Math.min(minLng, item.lng);
            maxLng = Math.max(maxLng, item.lng);
        }
    });

    if (minLat === Infinity) return null;

    return [[minLat, minLng], [maxLat, maxLng]];
}

export function fitToData(data, options = {}) {
    const bounds = calculateDataBounds(data);
    if (bounds) {
        return fitToBounds(bounds, options);
    }
    return false;
}

// Layer statistics
export function getLayerStats() {
    const stats = {};
    Object.entries(layerGroups).forEach(([name, layer]) => {
        stats[name] = {
            count: layer.getLayers().length,
            visible: map && map.hasLayer(layer)
        };
    });
    return stats;
}

// Map control functions
export function addOverlayControl(name, layer) {
    if (layerControl) {
        layerControl.addOverlay(layer, name);
        return true;
    }
    return false;
}

export function removeOverlayControl(layer) {
    if (layerControl) {
        layerControl.removeLayer(layer);
        return true;
    }
    return false;
}

// Cleanup function
export function destroyMap() {
    if (map) {
        map.remove();
        map = null;
        layerGroups = {};
        baseLayers = {};
        layerControl = null;
        console.log('Map destroyed');
    }
}

// Getter functions
export function getMap() {
    return map;
}

export function getLayerGroups() {
    return layerGroups;
}

export function getBaseLayers() {
    return baseLayers;
}

export function getLayerControl() {
    return layerControl;
}

// Map state functions for debugging/development
export function getMapState() {
    if (!map) return null;
    
    return {
        center: map.getCenter(),
        zoom: map.getZoom(),
        bounds: map.getBounds(),
        layerVisibility: getLayerVisibility(),
        layerStats: getLayerStats()
    };
}

export function logMapState() {
    console.log('Current map state:', getMapState());
}
