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

// UPDATED: Match your actual file names and new dataset structure
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

// UPDATED: Added prairie-specific colors and enhanced color scheme
export const COLORS = {
    quality: {
        excellent: '#155724',
        good: '#28a745', 
        fair: '#856404',
        poor: '#721c24'
    },
    dataset: {
        prairies: '#1e5928',        // Updated from 'training'
        connectivity: '#4a6b35',   // New color for connectivity data
        example: '#ff9800',
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

// ENHANCED: More comprehensive example data
export const EXAMPLE_DATA = [
    {
        name: "Kickapoo Valley Reserve",
        lat: 43.45, lng: -90.65,
        area: 185, connectivity: 87, species: 42, quality: 95,
        description: "Large, high-quality remnant with excellent connectivity to surrounding habitats. Key refuge for rare prairie species.",
        dataset: "example",
        feature_id: "example_1",
        isPolygon: false
    },
    {
        name: "Governor Dodge State Park",
        lat: 43.21, lng: -90.11,
        area: 73, connectivity: 72, species: 38, quality: 88,
        description: "Well-preserved hill prairie with moderate connectivity corridor potential. Active restoration site.",
        dataset: "example",
        feature_id: "example_2",
        isPolygon: false
    },
    {
        name: "Wyalusing State Park",
        lat: 43.15, lng: -91.10,
        area: 94, connectivity: 91, species: 45, quality: 92,
        description: "Mississippi River bluff prairie with high species diversity and connectivity. Research priority site.",
        dataset: "example",
        feature_id: "example_3",
        isPolygon: false
    },
    {
        name: "Blue Mounds State Park",
        lat: 43.04, lng: -89.85,
        area: 67, connectivity: 83, species: 41, quality: 86,
        description: "High-elevation prairie remnant with excellent native plant diversity. Educational demonstration site.",
        dataset: "example",
        feature_id: "example_4",
        isPolygon: false
    },
    {
        name: "Military Ridge Prairie",
        lat: 43.12, lng: -89.92,
        area: 45, connectivity: 68, species: 35, quality: 78,
        description: "Restored prairie along historic military road. Shows recovery potential of degraded sites.",
        dataset: "example",
        feature_id: "example_5",
        isPolygon: false
    }
];

// ENHANCED: More detailed species observations with iNaturalist-style data
export const EXAMPLE_SPECIES_OBSERVATIONS = [
    { 
        name: "Blazing Star", 
        scientific: "Liatris pycnostachya", 
        common_name: "Prairie Blazing Star",
        lat: 43.43, lng: -90.63, 
        count: 12,
        date: "2024-08-15",
        observer: "Prairie Research Team",
        quality_grade: "research",
        id: "obs_1"
    },
    { 
        name: "Prairie Rose", 
        scientific: "Rosa arkansana", 
        common_name: "Prairie Wild Rose",
        lat: 43.22, lng: -90.12, 
        count: 8,
        date: "2024-07-22",
        observer: "Field Botanist",
        quality_grade: "research",
        id: "obs_2"
    },
    { 
        name: "Big Bluestem", 
        scientific: "Andropogon gerardii", 
        common_name: "Big Bluestem Grass",
        lat: 43.16, lng: -91.08, 
        count: 25,
        date: "2024-09-03",
        observer: "Graduate Student",
        quality_grade: "research",
        id: "obs_3"
    },
    { 
        name: "Purple Coneflower", 
        scientific: "Echinacea purpurea", 
        common_name: "Eastern Purple Coneflower",
        lat: 43.05, lng: -89.87, 
        count: 15,
        date: "2024-08-28",
        observer: "Volunteer Monitor",
        quality_grade: "needs_id",
        id: "obs_4"
    },
    { 
        name: "Wild Bergamot", 
        scientific: "Monarda fistulosa", 
        common_name: "Wild Bergamot",
        lat: 43.38, lng: -90.58, 
        count: 19,
        date: "2024-07-10",
        observer: "iNaturalist User",
        quality_grade: "research",
        id: "obs_5"
    },
    { 
        name: "Compass Plant", 
        scientific: "Silphium laciniatum", 
        common_name: "Compass Plant",
        lat: 43.24, lng: -90.14, 
        count: 6,
        date: "2024-08-01",
        observer: "Prairie Specialist",
        quality_grade: "research",
        id: "obs_6"
    }
];

// ENHANCED: More detailed corridor information
export const EXAMPLE_CORRIDORS = [
    {
        name: "Kickapoo-Coon Creek Corridor",
        coordinates: [[43.45, -90.65], [43.42, -90.70], [43.39, -90.75]],
        quality: 85,
        strength: 85,
        length: 2.3,
        width: 150,
        habitat_type: "riparian_prairie",
        id: "corridor_1"
    },
    {
        name: "Mississippi River Bluff Corridor", 
        coordinates: [[43.15, -91.10], [43.12, -91.05], [43.10, -91.00]],
        quality: 92,
        strength: 92,
        length: 1.8,
        width: 200,
        habitat_type: "bluff_prairie",
        id: "corridor_2"
    },
    {
        name: "Blue Mounds Ridge Connection",
        coordinates: [[43.04, -89.85], [43.07, -89.88], [43.10, -89.90]],
        quality: 67,
        strength: 67,
        length: 1.2,
        width: 80,
        habitat_type: "upland_prairie",
        id: "corridor_3"
    }
];

export const PRIORITY_AREAS = [
    {
        name: "High Priority Conservation Area - Kickapoo Valley",
        coordinates: [[43.4, -90.7], [43.45, -90.65], [43.42, -90.6], [43.37, -90.65]],
        priority: "high",
        area: 1200,
        description: "Critical habitat linkage area with high restoration potential"
    },
    {
        name: "Medium Priority Conservation Area - Military Ridge", 
        coordinates: [[43.2, -90.15], [43.25, -90.1], [43.22, -90.05], [43.17, -90.1]],
        priority: "medium",
        area: 800,
        description: "Moderate connectivity value, suitable for targeted restoration"
    },
    {
        name: "High Priority Conservation Area - Mississippi Bluffs",
        coordinates: [[43.14, -91.12], [43.18, -91.08], [43.16, -91.04], [43.12, -91.08]],
        priority: "high", 
        area: 950,
        description: "Rare bluff prairie ecosystem with endangered species habitat"
    }
];

// ADDED: Filter configurations for UI
export const FILTER_CONFIG = {
    connectivity: { min: 0, max: 100, default: 0 },
    species: { min: 0, max: 50, default: 0 },
    area: { min: 0, max: 200, default: 0 }
};

// ADDED: Map layer configurations
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
