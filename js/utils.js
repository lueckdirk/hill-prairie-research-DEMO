// js/utils.js
// Utility functions for Hill Prairie Research Application

import { COLORS } from './config.js';

// Color functions
export function getQualityColor(quality) {
    if (quality > 80) return COLORS.quality.excellent;
    if (quality > 60) return COLORS.quality.good;
    if (quality > 40) return COLORS.quality.fair;
    return COLORS.quality.poor;
}

export function getDatasetColor(dataset) {
    return COLORS.dataset[dataset] || COLORS.dataset.default;
}

export function getConnectivityColor(quality) {
    return COLORS.connectivity[quality] || COLORS.connectivity.low;
}

export function getPriorityColor(priority) {
    return COLORS.priority[priority] || COLORS.priority.low;
}

// Coordinate validation
export function validateCoordinates(lat, lng) {
    // Validate coordinates are in expected range (Driftless region)
    return lat >= 42 && lat <= 45 && lng >= -93 && lng <= -88;
}

// Extract coordinates from different geometry types
export function extractCoordinates(geometry) {
    try {
        if (geometry.type === 'Point') {
            const lng = geometry.coordinates[0];
            const lat = geometry.coordinates[1];
            return { lat, lng, isPolygon: false };
        } else if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
            // Calculate centroid for polygons
            const coords = geometry.type === 'Polygon' ? 
                geometry.coordinates[0] : 
                geometry.coordinates[0][0];
            const lng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
            const lat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
            return { lat, lng, isPolygon: true };
        } else {
            throw new Error(`Unsupported geometry type: ${geometry.type}`);
        }
    } catch (error) {
        console.error('Error extracting coordinates:', error);
        return null;
    }
}

// Generate popup content for prairie sites
export function generatePrairiePopupContent(prairie) {
    return `
        <div class="popup-content">
            <h3>${prairie.name}</h3>
            <div class="popup-metric">
                <span>Dataset:</span>
                <strong>${prairie.dataset.charAt(0).toUpperCase() + prairie.dataset.slice(1)}</strong>
            </div>
            <div class="popup-metric">
                <span>Geometry:</span>
                <strong>${prairie.isPolygon ? 'Polygon' : 'Point'}</strong>
            </div>
            <div class="popup-metric">
                <span>Area:</span>
                <strong>${typeof prairie.area === 'number' ? prairie.area.toFixed(1) : prairie.area} hectares</strong>
            </div>
            <div class="popup-metric">
                <span>Connectivity:</span>
                <strong>${prairie.connectivity.toFixed(1)}%</strong>
            </div>
            <div class="popup-metric">
                <span>Species Count:</span>
                <strong>${prairie.species}</strong>
            </div>
            <div class="popup-metric">
                <span>Habitat Quality:</span>
                <strong>${prairie.quality.toFixed(1)}%</strong>
            </div>
            <p style="margin-top: 10px; font-style: italic; color: #666;">${prairie.description}</p>
        </div>
    `;
}

// Generate popup content for species observations
export function generateSpeciesPopupContent(observation) {
    return `
        <div class="popup-content">
            <h3>${observation.name}</h3>
            <div class="popup-metric">
                <span>Scientific Name:</span>
                <strong><em>${observation.scientific}</em></strong>
            </div>
            <div class="popup-metric">
                <span>Observations:</span>
                <strong>${observation.count}</strong>
            </div>
            <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                Data contributed by citizen scientists via iNaturalist
            </p>
        </div>
    `;
}

// Generate popup content for connectivity corridors
export function generateCorridorPopupContent(corridor) {
    return `
        <div class="popup-content">
            <h3>${corridor.name}</h3>
            <div class="popup-metric">
                <span>Quality:</span>
                <strong>${corridor.quality.charAt(0).toUpperCase() + corridor.quality.slice(1)}</strong>
            </div>
        </div>
    `;
}

// Generate popup content for priority areas
export function generatePriorityAreaPopupContent(area) {
    return `
        <div class="popup-content">
            <h3>${area.name}</h3>
            <div class="popup-metric">
                <span>Priority Level:</span>
                <strong>${area.priority.charAt(0).toUpperCase() + area.priority.slice(1)}</strong>
            </div>
        </div>
    `;
}

// Calculate statistics from data
export function calculateStats(prairieData, iNaturalistData, visibleLayers) {
    const visiblePrairies = visibleLayers || 0;
    const totalArea = prairieData.reduce((sum, prairie) => sum + (prairie.area || 0), 0);
    const uniqueSpecies = new Set(iNaturalistData.map(obs => obs.scientific)).size;
    const totalObservations = iNaturalistData.reduce((sum, obs) => sum + obs.count, 0);
    
    return {
        prairies: visiblePrairies,
        area: totalArea.toFixed(1) + ' ha',
        species: uniqueSpecies,
        observations: totalObservations
    };
}

// Data filtering helpers
export function filterPrairieData(prairieData, filters) {
    return prairieData.filter(prairie => {
        // Dataset type filter
        if ((prairie.dataset === 'training' && !filters.showTraining) ||
            (prairie.dataset === 'validation' && !filters.showValidation) ||
            (prairie.dataset === 'example' && !filters.showExample)) {
            return false;
        }
        
        // Metric filters
        return prairie.connectivity >= filters.connectivityMin && 
               prairie.species >= filters.speciesMin;
    });
}

// Debounce function for performance optimization
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
