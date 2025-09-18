// js/dataLoader.js
// Data loading and processing functions

import { DATA_FILES, EXAMPLE_DATA, EXAMPLE_SPECIES_OBSERVATIONS } from './config.js';

// Global data storage
export let prairieData = [];
export let allFeatures = [];
export let iNaturalistData = [];

// Error handling
export function showError(message) {
    const errorContainer = document.getElementById('error-container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<strong>Data Loading Issue:</strong> ${message}`;
    errorContainer.appendChild(errorDiv);
}

// Loading indicator
export function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

// Process location features (training/validation sites)
export function processLocationFeatures(data, datasetType) {
    data.features.forEach((feature, index) => {
        const props = feature.properties;
        
        // Get coordinates - handle different geometry types
        let lat, lng;
        let geometryForDisplay = feature.geometry;
        let isPolygon = false;
        
        try {
            if (feature.geometry.type === 'Point') {
                lng = feature.geometry.coordinates[0];
                lat = feature.geometry.coordinates[1];
            } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                isPolygon = true;
                // Calculate centroid for polygons
                const coords = feature.geometry.type === 'Polygon' ? 
                    feature.geometry.coordinates[0] : 
                    feature.geometry.coordinates[0][0];
                lng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
                lat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
            } else {
                console.warn(`Unsupported geometry type: ${feature.geometry.type}`);
                return;
            }

            // Validate coordinates are in expected range (Driftless region)
            if (lat < 42 || lat > 45 || lng < -93 || lng > -88) {
                console.warn(`Coordinates outside expected range: ${lat}, ${lng}`);
            }
        } catch (coordError) {
            console.error(`Error extracting coordinates for feature ${index}:`, coordError);
            return;
        }
        
        // Map properties with comprehensive fallbacks
        const siteData = {
            name: props.site_name || props.name || props.Site_Name || props.location || `${datasetType.charAt(0).toUpperCase() + datasetType.slice(1)} Site ${index + 1}`,
            lat: lat,
            lng: lng,
            area: parseFloat(props.area_ha || props.area || props.Area_ha || props.AREA || 0),
            connectivity: parseFloat(props.connectivity_score || props.connectivity || props.Connectivity || Math.random() * 100),
            species: parseInt(props.species_count || props.richness || props.species_richness || props.Species_Count || Math.floor(Math.random() * 50)),
            quality: parseFloat(props.habitat_quality || props.quality || props.Quality || props.habitat_score || Math.random() * 100),
            description: props.description || props.Description || props.notes || `${datasetType.charAt(0).toUpperCase() + datasetType.slice(1)} dataset location for ML model`,
            dataset: datasetType,
            feature_id: props.id || props.ID || props.FID || index,
            geometry: geometryForDisplay,
            isPolygon: isPolygon,
            // Store original properties for debugging
            originalProps: props
        };
        
        // Log first few features for debugging
        if (index < 3) {
            console.log(`Sample ${datasetType} feature:`, {
                name: siteData.name,
                coords: [lat, lng],
                area: siteData.area,
                isPolygon: isPolygon,
                originalProps: Object.keys(props)
            });
        }
        
        prairieData.push(siteData);
        allFeatures.push({...feature, displayData: siteData});
    });
}

// Process connectivity features (lines/corridors)
export function processConnectivityFeatures(data) {
    console.log(`Processing ${data.features.length} connectivity features`);
    // This will be used to populate connectivity layers
    data.features.forEach((feature, index) => {
        if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
            console.log(`Connectivity feature ${index}:`, feature.properties);
        }
    });
}

// Update data source controls based on what was successfully loaded
export function updateDataSourceControls(loadedDatasets) {
    const controls = {
        'show-training': loadedDatasets.includes('training'),
        'show-validation': loadedDatasets.includes('validation')
    };

    Object.entries(controls).forEach(([controlId, hasData]) => {
        const control = document.getElementById(controlId);
        const label = control.nextElementSibling;
        
        if (hasData) {
            control.disabled = false;
            label.style.opacity = '1';
            label.title = 'Data loaded successfully';
        } else {
            control.disabled = true;
            control.checked = false;
            label.style.opacity = '0.5';
            label.title = 'Data file not found or failed to load';
        }
    });
}

// Load GeoJSON data
export async function loadGeoJSONData() {
    showLoading(true);
    let loadedDatasets = [];
    
    try {
        // Try to load each data file
        for (const dataFile of DATA_FILES) {
            try {
                console.log(`Attempting to load: ${dataFile.file}`);
                const response = await fetch(dataFile.file);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Successfully loaded ${dataFile.label}: ${data.features.length} features`);
                    loadedDatasets.push(dataFile.type);
                    
                    // Process features based on type
                    if (dataFile.type === 'training' || dataFile.type === 'validation') {
                        processLocationFeatures(data, dataFile.type);
                    } else if (dataFile.type === 'connectivity') {
                        processConnectivityFeatures(data);
                    }
                } else {
                    console.warn(`❌ Failed to load ${dataFile.label}: HTTP ${response.status}`);
                    showError(`${dataFile.label} file returned HTTP ${response.status}. Check file path and server configuration.`);
                }
            } catch (fetchError) {
                console.warn(`❌ Error loading ${dataFile.label}:`, fetchError.message);
                showError(`Cannot access ${dataFile.label}. Check if file exists in /data folder.`);
            }
        }

        // Always add example data for demonstration
        prairieData.push(...EXAMPLE_DATA);
        iNaturalistData.push(...EXAMPLE_SPECIES_OBSERVATIONS);
        console.log(`📊 Total prairie sites loaded: ${prairieData.length}`);

        // Update UI based on what was loaded
        updateDataSourceControls(loadedDatasets);
        
    } catch (error) {
        console.error('❌ Critical error loading GeoJSON data:', error);
        showError('Critical error loading research data files. Using example data only.');
        prairieData = [...EXAMPLE_DATA];
        iNaturalistData = [...EXAMPLE_SPECIES_OBSERVATIONS];
    }
    
    showLoading(false);
}

// Getter functions for accessing data from other modules
export function getPrairieData() {
    return prairieData;
}

export function getINaturalistData() {
    return iNaturalistData;
}

export function getAllFeatures() {
    return allFeatures;
}
