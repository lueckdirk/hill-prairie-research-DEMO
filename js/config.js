// js/config.js
// Configuration and constants for Hill Prairie Research Application

// UPDATED: Centered on La Crosse County, Wisconsin
export const MAP_CONFIG = {
    center: [43.8041, -91.2396], // La Crosse County coordinates
    defaultZoom: 11, // Zoomed in to county level
    bounds: [[42.0, -93.0], [45.0, -88.0]] // Driftless region bounds
};

export const TILE_LAYERS = {
    osm: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors'
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '© Esri'
    },
    topo: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: '© Esri'
    }
};

// Data files to load - matches your actual file names
export const DATA_FILES = [
    { 
        file: 'data/prairies.geojson', 
        type: 'prairies', 
        label: 'Prairie Remnant Sites' 
    },
    { 
        file: 'data/connectivity.geojson', 
        type: 'connectivity', 
        label: 'Connectivity Corridors' 
    },
    { 
        file: 'data/iNat.geojson', 
        type: 'inaturalist', 
        label: 'iNaturalist Observations' 
    }
];

// Color scheme for different data types and quality levels
export const COLORS = {
    quality: {
        excellent: '#155724',
        good: '#28a745', 
        fair: '#856404',
        poor: '#721c24'
    },
    dataset: {
        prairies: '#1e5928',
        connectivity: '#4a6b35',
        inaturalist: '#74ac00',
        default: '#6c757d'
    },
    connectivity: {
        high: '#28a745',
        medium: '#ffc107',
        low: '#dc3545'
    },
    priority: {
        high: '#dc3545',
        medium: '#ffc107',
        low: '#28a745'
    },
    inaturalist: '#74ac00'
};

// Filter configurations for UI
export const FILTER_CONFIG = {
    connectivity: { min: 0, max: 100, default: 0 },
    species: { min: 0, max: 50, default: 0 },
    area: { min: 0, max: 200, default: 0 }
};

// Map layer configurations
export const LAYER_CONFIG = {
    prairieLayer: {
        name: "Hill Prairie Remnants",
        defaultVisible: true
    },
    connectivityLayer: {
        name: "Connectivity Corridors", 
        defaultVisible: false
    },
    speciesLayer: {
        name: "Species Observations",
        defaultVisible: false
    },
    habitatLayer: {
        name: "Habitat Suitability",
        defaultVisible: false
    },
    priorityLayer: {
        name: "Conservation Priority",
        defaultVisible: false
    }
};

// Priority areas for conservation (placeholder - add real data as needed)
export const PRIORITY_AREAS = [
    // Add your priority area data here if needed
    // Example format:
    // {
    //     name: "Priority Area 1",
    //     priority: "high",
    //     area: 150,
    //     coordinates: [[lat, lng], [lat, lng], ...],
    //     description: "High priority conservation area"
    // }
];

// REMOVED: All example/demo data exports
// The following have been removed:
// - EXAMPLE_DATA
// - EXAMPLE_SPECIES_OBSERVATIONS  
// - EXAMPLE_CORRIDORS
//
// The application now relies entirely on real GeoJSON data files
// loaded from the /data directory.
