// js/layerRenderer.js
// Functions for rendering different map layers

import { EXAMPLE_CORRIDORS, PRIORITY_AREAS, COLORS } from './config.js';
import { getPrairieData, getINaturalistData, getConnectivityData } from './dataLoader.js';
import { getLayerGroups } from './mapManager.js';
import { 
    getQualityColor, 
    getDatasetColor, 
    getConnectivityColor,
    getPriorityColor,
    generatePrairiePopupContent,
    generateSpeciesPopupContent,
    generateCorridorPopupContent,
    generatePriorityAreaPopupContent,
    filterPrairieData
} from './utils.js';

// Get filter values from UI - FULLY UPDATED
function getFilterValues() {
    const safeGetValue = (id, defaultValue = false) => {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Filter element ${id} not found`);
            return defaultValue;
        }
        return element.type === 'checkbox' ? element.checked : element.value;
    };

    return {
        connectivityMin: parseInt(safeGetValue('connectivity-filter', 0)),
        speciesMin: parseInt(safeGetValue('species-filter', 0)),
        areaMin: parseFloat(safeGetValue('area-filter', 0)),
        showPrairies: safeGetValue('show-prairies', false),
        showConnectivity: safeGetValue('show-connectivity', false),
        showExample: safeGetValue('show-example', true),
        showINaturalist: safeGetValue('show-inaturalist', true)
    };
}

// Update prairie display - FULLY UPDATED
export function updatePrairieDisplay() {
    const layers = getLayerGroups();
    if (!layers || !layers.prairieLayer) {
        console.warn('Prairie layer not available');
        return;
    }

    const prairieData = getPrairieData();
    const filters = getFilterValues();
    
    layers.prairieLayer.clearLayers();
    
    const filteredPrairies = filterPrairieData(prairieData, filters);
    
    filteredPrairies.forEach((prairie, index) => {
        let marker;
        
        try {
            if (prairie.isPolygon && prairie.geometry) {
                // Render as polygon for prairie features
                const coords = prairie.geometry.type === 'Polygon' ? 
                    prairie.geometry.coordinates[0].map(coord => [coord[1], coord[0]]) :
                    prairie.geometry.coordinates[0][0].map(coord => [coord[1], coord[0]]);
                    
                marker = L.polygon(coords, {
                    color: prairie.dataset === 'example' ? '#2c5530' : 
                           prairie.dataset === 'prairies' ? '#1e5928' : '#2c5530',
                    weight: 2,
                    opacity: 0.8,
                    fillColor: prairie.dataset === 'example' ? getQualityColor(prairie.quality) : getDatasetColor(prairie.dataset),
                    fillOpacity: 0.6
                });
            } else {
                // Render as circle marker for point features or fallback
                const radius = prairie.area ? Math.sqrt(prairie.area) / 2 + 5 : 8;
                
                marker = L.circleMarker([prairie.lat, prairie.lng], {
                    radius: Math.max(radius, 5), // Minimum radius of 5
                    fillColor: prairie.dataset === 'example' ? getQualityColor(prairie.quality) : getDatasetColor(prairie.dataset),
                    color: prairie.dataset === 'example' ? '#2c5530' : 
                           prairie.dataset === 'prairies' ? '#1e5928' : '#2c5530',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            }

            const popupContent = generatePrairiePopupContent(prairie);
            marker.bindPopup(popupContent);
            marker.addTo(layers.prairieLayer);
        } catch (error) {
            console.error(`Error rendering prairie feature ${index}:`, error, prairie);
        }
    });

    console.log(`Rendered ${filteredPrairies.length} prairie features`);
}

// Update connectivity corridors display - FULLY UPDATED
export function updateConnectivityDisplay() {
    const layers = getLayerGroups();
    if (!layers || !layers.connectivityLayer) {
        console.warn('Connectivity layer not available');
        return;
    }

    const connectivityData = getConnectivityData();
    const filters = getFilterValues();
    
    layers.connectivityLayer.clearLayers();
    let renderedCount = 0;
    
    // Show real connectivity data if available and enabled
    if (filters.showConnectivity && connectivityData && connectivityData.length > 0) {
        connectivityData.forEach((corridor, index) => {
            try {
                if (corridor.geometry && (corridor.geometry.type === 'LineString' || corridor.geometry.type === 'MultiLineString')) {
                    const coords = corridor.geometry.type === 'LineString' ?
                        corridor.geometry.coordinates.map(coord => [coord[1], coord[0]]) :
                        corridor.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
                    
                    // Filter by connectivity strength if specified
                    const strength = corridor.strength || corridor.quality || 50;
                    if (strength >= filters.connectivityMin) {
                        const polyline = L.polyline(coords, {
                            color: getConnectivityColor(strength),
                            weight: Math.max(2, strength / 25 + 2), // Weight based on strength
                            opacity: 0.8,
                            className: 'connectivity-corridor'
                        });
                        
                        const popupContent = generateCorridorPopupContent(corridor);
                        polyline.bindPopup(popupContent);
                        polyline.addTo(layers.connectivityLayer);
                        renderedCount++;
                    }
                }
            } catch (error) {
                console.error(`Error rendering connectivity feature ${index}:`, error, corridor);
            }
        });
    }
    
    // Fallback to example corridors if no real data or if example is enabled
    if (filters.showExample && (connectivityData.length === 0 || renderedCount === 0)) {
        EXAMPLE_CORRIDORS.forEach((corridor, index) => {
            try {
                const quality = corridor.quality || 50;
                if (quality >= filters.connectivityMin) {
                    const color = getConnectivityColor(quality);
                    
                    const polyline = L.polyline(corridor.coordinates, {
                        color: color,
                        weight: 4,
                        opacity: 0.8,
                        dashArray: '5, 5', // Dashed line for example data
                        className: 'example-corridor'
                    });
                    
                    const popupContent = generateCorridorPopupContent({
                        ...corridor,
                        isExample: true
                    });
                    polyline.bindPopup(popupContent);
                    polyline.addTo(layers.connectivityLayer);
                    renderedCount++;
                }
            } catch (error) {
                console.error(`Error rendering example corridor ${index}:`, error);
            }
        });
    }

    console.log(`Rendered ${renderedCount} connectivity features`);
}

// Update species observations display - ENHANCED WITH DEBUGGING
export function updateSpeciesDisplay() {
    console.log('Starting updateSpeciesDisplay function');
    
    const layers = getLayerGroups();
    if (!layers || !layers.speciesLayer) {
        console.warn('Species layer not available');
        return;
    }

    const iNaturalistData = getINaturalistData();
    const filters = getFilterValues();
    
    console.log('iNaturalist data:', iNaturalistData);
    console.log('Filters:', filters);
    
    layers.speciesLayer.clearLayers();
    let renderedCount = 0;
    
    if (filters.showINaturalist && iNaturalistData && iNaturalistData.length > 0) {
        // Group observations by species for better clustering
        const speciesGroups = {};
        
        iNaturalistData.forEach((observation, index) => {
            try {
                // Validate coordinates
                if (!observation.lat || !observation.lng || 
                    observation.lat < 42 || observation.lat > 45 || 
                    observation.lng < -93 || observation.lng > -88) {
                    return;
                }

                const species = observation.species || observation.common_name || observation.name || 'Unknown Species';
                if (!speciesGroups[species]) {
                    speciesGroups[species] = [];
                }
                speciesGroups[species].push(observation);
            } catch (error) {
                console.error(`Error processing iNaturalist observation ${index}:`, error);
            }
        });

        console.log('Species groups created:', Object.keys(speciesGroups));

        // Render observations
        Object.entries(speciesGroups).forEach(([species, observations]) => {
            observations.forEach((observation, obsIndex) => {
                try {
                    console.log(`Processing observation ${obsIndex} for ${species}:`, observation);
                    
                    const marker = L.circleMarker([observation.lat, observation.lng], {
                        radius: 4,
                        fillColor: COLORS.inaturalist || '#74ac00',
                        color: '#4a6b00',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8,
                        className: 'inaturalist-marker'
                    });
                    
                    console.log('About to generate popup content for:', observation);
                    const popupContent = generateSpeciesPopupContent(observation);
                    console.log('Generated popup content:', popupContent);
                    
                    marker.bindPopup(popupContent);
                    marker.addTo(layers.speciesLayer);
                    renderedCount++;
                } catch (error) {
                    console.error(`Error rendering species observation:`, error, observation);
                }
            });
        });
    } else {
        console.log('Species display skipped - showINaturalist:', filters.showINaturalist, 'data length:', iNaturalistData ? iNaturalistData.length : 0);
    }

    console.log(`Rendered ${renderedCount} species observations`);
}

// Update habitat suitability display - ENHANCED
export function updateHabitatDisplay() {
    const layers = getLayerGroups();
    if (!layers || !layers.habitatLayer) {
        console.warn('Habitat layer not available');
        return;
    }

    layers.habitatLayer.clearLayers();
    
    try {
        // Create habitat suitability grid overlay (example)
        const bounds = [[43.0, -91.5], [43.5, -89.5]];
        const imageOverlay = L.imageOverlay('data:image/svg+xml;base64,' + btoa(`
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="habitat" patternUnits="userSpaceOnUse" width="20" height="20">
                        <rect width="20" height="20" fill="#28a745" opacity="0.3"/>
                        <circle cx="10" cy="10" r="5" fill="#155724" opacity="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#habitat)"/>
                <text x="100" y="100" text-anchor="middle" fill="#155724" font-size="12">
                    Habitat Suitability Model (Example)
                </text>
            </svg>
        `), bounds, {
            opacity: 0.4,
            className: 'habitat-overlay'
        });
        
        imageOverlay.addTo(layers.habitatLayer);
        console.log('Habitat suitability overlay rendered');
    } catch (error) {
        console.error('Error rendering habitat overlay:', error);
    }
}

// Update conservation priority areas - ENHANCED
export function updatePriorityDisplay() {
    const layers = getLayerGroups();
    if (!layers || !layers.priorityLayer) {
        console.warn('Priority layer not available');
        return;
    }

    layers.priorityLayer.clearLayers();
    let renderedCount = 0;
    
    if (PRIORITY_AREAS && PRIORITY_AREAS.length > 0) {
        PRIORITY_AREAS.forEach((area, index) => {
            try {
                const color = getPriorityColor(area.priority);
                
                const polygon = L.polygon(area.coordinates, {
                    color: color,
                    weight: 2,
                    opacity: 0.8,
                    fillColor: color,
                    fillOpacity: 0.2,
                    className: 'priority-area'
                });
                
                const popupContent = generatePriorityAreaPopupContent ? 
                    generatePriorityAreaPopupContent(area) : 
                    `<strong>Priority Area</strong><br>Priority Level: ${area.priority}`;
                    
                polygon.bindPopup(popupContent);
                polygon.addTo(layers.priorityLayer);
                renderedCount++;
            } catch (error) {
                console.error(`Error rendering priority area ${index}:`, error);
            }
        });
    }

    console.log(`Rendered ${renderedCount} priority areas`);
}

// Update all layers with error handling (convenience function)
export function updateAllLayers() {
    console.log('Updating all map layers...');
    
    try {
        updatePrairieDisplay();
    } catch (error) {
        console.error('Error updating prairie display:', error);
    }
    
    try {
        updateConnectivityDisplay();
    } catch (error) {
        console.error('Error updating connectivity display:', error);
    }
    
    try {
        updateSpeciesDisplay();
    } catch (error) {
        console.error('Error updating species display:', error);
    }
    
    try {
        updateHabitatDisplay();
    } catch (error) {
        console.error('Error updating habitat display:', error);
    }
    
    try {
        updatePriorityDisplay();
    } catch (error) {
        console.error('Error updating priority display:', error);
    }
    
    console.log('All layer updates completed');
}

// Get current layer statistics (utility function)
export function getLayerStats() {
    const layers = getLayerGroups();
    if (!layers) return {};
    
    return {
        prairies: layers.prairieLayer ? layers.prairieLayer.getLayers().length : 0,
        connectivity: layers.connectivityLayer ? layers.connectivityLayer.getLayers().length : 0,
        species: layers.speciesLayer ? layers.speciesLayer.getLayers().length : 0,
        habitat: layers.habitatLayer ? layers.habitatLayer.getLayers().length : 0,
        priority: layers.priorityLayer ? layers.priorityLayer.getLayers().length : 0
    };
}
