// js/config.js
// Configuration and constants for Hill Prairie Research Application

export const MAP_CONFIG = {
    center: [43.25, -90.8],
    defaultZoom: 10,
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

export const DATA_FILES = [
    { file: 'data/training_features.geojson', type: 'training', label: 'Training Features' },
    { file: 'data/validation_features.geojson', type: 'validation', label: 'Validation Features' },
    { file: 'data/connectivity_results.geojson', type: 'connectivity', label: 'Connectivity Data' }
];

export const COLORS = {
    quality: {
        excellent: '#155724',
        good: '#28a745', 
        fair: '#856404',
        poor: '#721c24'
    },
    dataset: {
        training: '#28a745',
        validation: '#9c27b0',
        example: '#ff9800',
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

export const EXAMPLE_DATA = [
    {
        name: "Kickapoo Valley Reserve",
        lat: 43.45, lng: -90.65,
        area: 185, connectivity: 87, species: 42, quality: 95,
        description: "Large, high-quality remnant with excellent connectivity to surrounding habitats.",
        dataset: "example"
    },
    {
        name: "Governor Dodge State Park",
        lat: 43.21, lng: -90.11,
        area: 73, connectivity: 72, species: 38, quality: 88,
        description: "Well-preserved hill prairie with moderate connectivity corridor potential.",
        dataset: "example"
    },
    {
        name: "Wyalusing State Park",
        lat: 43.15, lng: -91.10,
        area: 94, connectivity: 91, species: 45, quality: 92,
        description: "Mississippi River bluff prairie with high species diversity and connectivity.",
        dataset: "example"
    },
    {
        name: "Blue Mounds State Park",
        lat: 43.04, lng: -89.85,
        area: 67, connectivity: 83, species: 41, quality: 86,
        description: "High-elevation prairie remnant with excellent native plant diversity.",
        dataset: "example"
    }
];

export const EXAMPLE_SPECIES_OBSERVATIONS = [
    { name: "Blazing Star", scientific: "Liatris pycnostachya", lat: 43.43, lng: -90.63, count: 12 },
    { name: "Prairie Rose", scientific: "Rosa arkansana", lat: 43.22, lng: -90.12, count: 8 },
    { name: "Big Bluestem", scientific: "Andropogon gerardii", lat: 43.16, lng: -91.08, count: 25 },
    { name: "Purple Coneflower", scientific: "Echinacea purpurea", lat: 43.05, lng: -89.87, count: 15 },
    { name: "Wild Bergamot", scientific: "Monarda fistulosa", lat: 43.38, lng: -90.58, count: 19 },
    { name: "Compass Plant", scientific: "Silphium laciniatum", lat: 43.24, lng: -90.14, count: 6 }
];

export const EXAMPLE_CORRIDORS = [
    {
        name: "Kickapoo-Coon Creek Corridor",
        coordinates: [[43.45, -90.65], [43.42, -90.70], [43.39, -90.75]],
        quality: "high"
    },
    {
        name: "Mississippi River Bluff Corridor", 
        coordinates: [[43.15, -91.10], [43.12, -91.05], [43.10, -91.00]],
        quality: "high"
    }
];

export const PRIORITY_AREAS = [
    {
        name: "High Priority Conservation Area",
        coordinates: [[43.4, -90.7], [43.45, -90.65], [43.42, -90.6], [43.37, -90.65]],
        priority: "high"
    },
    {
        name: "Medium Priority Conservation Area", 
        coordinates: [[43.2, -90.15], [43.25, -90.1], [43.22, -90.05], [43.17, -90.1]],
        priority: "medium"
    }
];
