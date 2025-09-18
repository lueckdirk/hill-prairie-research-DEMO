// js/mapManager.js
// Map initialization and management

import { MAP_CONFIG, TILE_LAYERS } from './config.js';

// Global map and layer references
let map = null;
let layerGroups = {};

// Initialize map and base layers
export function initializeMap() {
    // Initialize map centered on Driftless Region
    map = L.map('map').setView(MAP_CONFIG.center, MAP_CONFIG.defaultZoom);

    // Add base layers
    const baseLayers = createBaseLayers();
    
    // Start with OpenStreetMap
    baseLayers.osm.addTo(map);
    
    // Add layer control
    L.control.layers(baseLayers).addTo(map);
    
    // Initialize layer groups
    layerGroups = {
        prairieLayer: L.layerGroup(),
        connectivityLayer: L.layerGroup(),
        speciesLayer: L.layerGroup(),
        habitatLayer: L.layerGroup(),
        priorityLayer: L.layerGroup()
    };
    
    return map;
}

// Create base tile layers
function createBaseLayers() {
    const osm = L.tileLayer(TILE_LAYERS.osm.url, {
        attribution: TILE_LAYERS.osm.attribution
    });

    const satellite = L.tileLayer(TILE_LAYERS.satellite.url, {
        attribution: TILE_LAYERS.satellite.attribution
    });

    const topo = L.tileLayer(TILE_LAYERS.topo.url, {
        attribution: TILE_LAYERS.topo.attribution
    });

    return {
        "OpenStreetMap": osm,
        "Satellite": satellite,
        "Topographic": topo,
        osm: osm,
        satellite: satellite,
        topo: topo
    };
}

// Getter functions
export function getMap() {
    return map;
}

export function getLayerGroups() {
    return layerGroups;
}

// Layer management functions
export function addLayer(layerName) {
    if (layerGroups[layerName] && map) {
        map.addLayer(layerGroups[layerName]);
    }
}

export function removeLayer(layerName) {
    if (layerGroups[layerName] && map) {
        map.removeLayer(layerGroups[layerName]);
    }
}

export function clearLayer(layerName) {
    if (layerGroups[layerName]) {
        layerGroups[layerName].clearLayers();
    }
}

// Map utility functions
export function fitToBounds(bounds) {
    if (map) {
        map.fitBounds(bounds);
    }
}

export function setView(center, zoom) {
    if (map) {
        map.setView(center, zoom);
    }
}
