// js/dataLoader.js
// Data loading and processing functions

import { DATA_FILES, EXAMPLE_DATA, EXAMPLE_SPECIES_OBSERVATIONS } from './config.js';

// Global data storage
export let prairieData = [];
export let allFeatures = [];
export let iNaturalistData = [];
export let connectivityData = [];

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

// Process prairie site features
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
            name: props.site_name || props.name || props.Site_Name || props.location || `Prairie Site ${index + 1}`,
            lat: lat,
            lng: lng,
            area: parseFloat(props.area_ha || props.area || props.Area_ha || props.AREA || 0),
            connectivity: parseFloat(props.connectivity_score || props.connectivity || props.Connectivity || Math.random() * 100),
            species: parseInt(props.species_count || props.richness || props.species_richness || props.Species_Count || Math.floor(Math.random() * 50)),
            quality: parseFloat(props.habitat_quality || props.quality || props.Quality || props.habitat_score || Math.random() * 100),
            description: props.description || props.Description || props.notes || `Prairie restoration site for biodiversity research`,
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
    
    data.features.forEach((feature, index) => {
        if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
            const props = feature.properties;
            
            const connectivityFeature = {
                id: props.id || props.ID || props.FID || index,
                name: props.name || props.corridor_name || `Corridor ${index + 1}`,
                strength: parseFloat(props.strength || props.connectivity_strength || Math.random() * 100),
                length: parseFloat(props.length || props.corridor_length || 0),
                width: parseFloat(props.width || props.corridor_width || 0),
                habitat_type: props.habitat_type || props.type || 'mixed',
                geometry: feature.geometry,
                originalProps: props
            };
            
            connectivityData.push(connectivityFeature);
            allFeatures.push({...feature, displayData: connectivityFeature});
            
            if (index < 3) {
                console.log(`Sample connectivity feature:`, {
                    name: connectivityFeature.name,
                    strength: connectivityFeature.strength,
                    length: connectivityFeature.length
                });
            }
        }
    });
}

// Process iNaturalist observations
export function processINaturalistData(data) {
    console.log(`Processing ${data.features.length} iNaturalist observations`);
    
    data.features.forEach((feature, index) => {
        const props = feature.properties;
        
        try {
            if (feature.geometry.type !== 'Point') {
                console.warn(`iNaturalist observation ${index} is not a Point geometry`);
                return;
            }
            
            // Map the actual field names from your GeoJSON
            const observation = {
                // Core identification fields
                id: props.id,
                name: props.name, // Scientific name (can be null for unidentified)
                species: props.name, // Keep for backwards compatibility
                iconic_taxon_name: props.iconic_taxon_name, // e.g., "Insecta", "Plantae"
                taxon_id: props.taxon_id,
                rank: props.rank, // e.g., "species", "genus", "family"
                
                // Location
                lat: feature.geometry.coordinates[1],
                lng: feature.geometry.coordinates[0],
                coordinates: feature.geometry.coordinates, // Keep original [lng, lat]
                geoprivacy: props.geoprivacy,
                precision: props.precision,
                
                // Observation details
                date: props.date,
                obs_login: props.obs_login,
                obs_name: props.obs_name,
                observer: props.obs_name || props.obs_login || 'Unknown', // Convenience field
                description: props.description,
                quality: props.quality, // "research", "needs_id", etc.
                quality_grade: props.quality, // Keep for backwards compatibility
                
                // Media
                picture1: props.picture1,
                picture2: props.picture2,
                picture3: props.picture3,
                photo_url: props.picture1, // Keep for backwards compatibility
                
                // Links
                url: props.url,
                taxon_url: props.taxon_url,
                
                // Keep full geometry and original properties
                geometry: feature.geometry,
                originalProps: props
            };
            
            // Validate coordinates (Wisconsin Driftless region bounds)
            if (observation.lat < 42 || observation.lat > 45 || 
                observation.lng < -93 || observation.lng > -88) {
                console.warn(`iNaturalist observation outside expected range: ${observation.lat}, ${observation.lng}`);
            }
            
            iNaturalistData.push(observation);
            allFeatures.push({...feature, displayData: observation});
            
            // Log first few observations for debugging
            if (index < 3) {
                console.log(`Sample iNaturalist observation:`, {
                    id: observation.id,
                    name: observation.name || 'Unidentified',
                    taxon_type: observation.iconic_taxon_name,
                    observer: observation.observer,
                    coords: [observation.lat, observation.lng],
                    date: observation.date,
                    quality: observation.quality
                });
            }
        } catch (error) {
            console.error(`Error processing iNaturalist observation ${index}:`, error);
        }
    });
    
    // Log summary statistics
    const identifiedCount = iNaturalistData.filter(obs => obs.name !== null).length;
    const unidentifiedCount = iNaturalistData.filter(obs => obs.name === null).length;
    console.log(`Processed ${iNaturalistData.length} observations: ${identifiedCount} identified, ${unidentifiedCount} need ID`);
}

// Update data source controls based on what was successfully loaded
export function updateDataSourceControls(loadedDatasets) {
    const controls = {
        'show-prairies': loadedDatasets.includes('prairies'),
        'show-connectivity': loadedDatasets.includes('connectivity'),
        'show-inaturalist': loadedDatasets.includes('inaturalist')
    };

    Object.entries(controls).forEach(([controlId, hasData]) => {
        const control = document.getElementById(controlId);
        if (!control) {
            console.warn(`Control element ${controlId} not found in DOM`);
            return;
        }
        
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
    
    // Reset data arrays
    prairieData.length = 0;
    allFeatures.length = 0;
    iNaturalistData.length = 0;
    connectivityData.length = 0;
    
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
                    if (dataFile.type === 'prairies') {
                        processLocationFeatures(data, dataFile.type);
                    } else if (dataFile.type === 'connectivity') {
                        processConnectivityFeatures(data);
                    } else if (dataFile.type === 'inaturalist') {
                        processINaturalistData(data);
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
        console.log(`📊 Total connectivity features loaded: ${connectivityData.length}`);
        console.log(`📊 Total iNaturalist observations loaded: ${iNaturalistData.length}`);

        // Update UI based on what was loaded
        updateDataSourceControls(loadedDatasets);
        
    } catch (error) {
        console.error('❌ Critical error loading GeoJSON data:', error);
        showError('Critical error loading research data files. Using example data only.');
        prairieData.length = 0;
        prairieData.push(...EXAMPLE_DATA);
        iNaturalistData.length = 0;
        iNaturalistData.push(...EXAMPLE_SPECIES_OBSERVATIONS);
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

export function getConnectivityData() {
    return connectivityData;
}

export function getAllFeatures() {
    return allFeatures;
}
