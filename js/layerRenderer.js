// js/layerRenderer.js
// Functions for rendering different map layers

import { EXAMPLE_CORRIDORS, PRIORITY_AREAS, COLORS } from './config.js';
import { getPrairieData, getINaturalistData } from './dataLoader.js';
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

// Get filter values from UI
function getFilterValues() {
    return {
        connectivityMin: document.getElementById('connectivity-filter').value,
        speciesMin: document.getElementById('species-filter').value,
        showTraining: document.getElementById('show-training').checked,
        showValidation: document.getElementById('show-validation').checked,
        showExample: document.getElementById('show-example').checked,
        showINaturalist: document.getElementById('show-inaturalist').checked
    };
}

// Update prairie display
export function updatePrairieDisplay() {
    const layers = getLayerGroups();
    const prairieData = getPrairieData();
    const filters = getFilterValues();
    
    layers.prairieLayer.clearLayers();
    
    const filteredPrairies = filterPrairieData(prairieData, filters);
    
    filteredPrairies.forEach(prairie => {
        let marker;
        
        if (prairie.isPolygon && prairie.geometry) {
            // Render as polygon for training/validation features
            const coords = prairie.geometry.type === 'Polygon' ? 
                prairie.geometry.coordinates[0].map(coord => [coord[1], coord[0]]) :
                prairie.geometry.coordinates[0][0].map(coord => [coord[1], coord[0]]);
                
            marker = L.polygon(coords, {
                color: prairie.dataset === 'example' ? '#2c5530' : 
                       prairie.dataset === 'training' ? '#1e5928' : '#4a148c',
                weight: 2,
                opacity: 0.8,
                fillColor: prairie.dataset === 'example' ? getQualityColor(prairie.quality) : getDatasetColor(prairie.dataset),
                fillOpacity: 0.6
            });
        } else {
            // Render as circle marker for point features or fallback
            marker = L.circleMarker([prairie.lat, prairie.lng], {
                radius: Math.sqrt(prairie.area) / 2 + 5,
                fillColor: prairie.dataset === 'example' ? getQualityColor(prairie.quality) : getDatasetColor(prairie.dataset),
                color: prairie.dataset === 'example' ? '#2c5530' : 
                       prairie.dataset === 'training' ? '#1e5928' : '#4a148c',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            });
        }

        const popupContent = generatePrairiePopupContent(prairie);
        marker.bindPopup(popupContent);
        marker.addTo(layers.prairieLayer);
    });
}

// Update connectivity corridors display
export function updateConnectivityDisplay() {
    const layers = getLayerGroups();
    layers.connectivityLayer.clearLayers();
    
    EXAMPLE_CORRIDORS.forEach(corridor => {
        const color = getConnectivityColor(corridor.quality);
        
        const polyline = L.polyline(corridor.coordinates, {
            color: color,
            weight: 4,
            opacity: 0.8
        });
        
        const popupContent = generateCorridorPopupContent(corridor);
        polyline.bindPopup(popupContent);
        polyline.addTo(layers.connectivityLayer);
    });
}

// Update species observations display
export function updateSpeciesDisplay() {
    const layers = getLayerGroups();
    const iNaturalistData = getINaturalistData();
    const filters = getFilterValues();
    
    layers.speciesLayer.clearLayers();
    
    if (filters.showINaturalist) {
        iNaturalistData.forEach(observation => {
            const marker = L.circleMarker([observation.lat, observation.lng], {
                radius: 4,
                fillColor: COLORS.inaturalist,
                color: '#4a6b00',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
            
            const popupContent = generateSpeciesPopupContent(observation);
            marker.bindPopup(popupContent);
            marker.addTo(layers.speciesLayer);
        });
    }
}

// Update habitat suitability display
export function updateHabitatDisplay() {
    const layers = getLayerGroups();
    layers.habitatLayer.clearLayers();
    
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
        </svg>
    `), bounds, {
        opacity: 0.4
    });
    
    imageOverlay.addTo(layers.habitatLayer);
}

// Update conservation priority areas
export function updatePriorityDisplay() {
    const layers = getLayerGroups();
    layers.priorityLayer.clearLayers();
    
    PRIORITY_AREAS.forEach(area => {
        const color = getPriorityColor(area.priority);
        
        const polygon = L.polygon(area.coordinates, {
            color: color,
            weight: 2,
            opacity: 0.8,
            fillColor: color,
            fillOpacity: 0.2
        });
        
        const popupContent = generatePriorityAreaPopupContent(area);
        polygon.bindPopup(popupContent);
        polygon.addTo(layers.priorityLayer);
    });
}

// Update all layers (convenience function)
export function updateAllLayers() {
    updatePrairieDisplay();
    updateConnectivityDisplay();
    updateSpeciesDisplay();
    updateHabitatDisplay();
    updatePriorityDisplay();
}
