// js/utils.js
// Utility functions for Hill Prairie Research Application

import { COLORS } from './config.js';

// Color functions - ENHANCED
export function getQualityColor(quality) {
    if (quality > 80) return COLORS.quality.excellent;
    if (quality > 60) return COLORS.quality.good;
    if (quality > 40) return COLORS.quality.fair;
    return COLORS.quality.poor;
}

export function getDatasetColor(dataset) {
    return COLORS.dataset[dataset] || COLORS.dataset.default;
}

// FIXED: Handle both numeric and string values for connectivity
export function getConnectivityColor(quality) {
    // Handle numeric values (0-100)
    if (typeof quality === 'number') {
        if (quality > 70) return COLORS.connectivity.high;
        if (quality > 40) return COLORS.connectivity.medium;
        return COLORS.connectivity.low;
    }
    // Handle string values
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

// ENHANCED: Generate popup content for prairie sites
export function generatePrairiePopupContent(prairie) {
    const safeName = prairie.name || 'Unnamed Prairie Site';
    const safeDataset = prairie.dataset ? prairie.dataset.charAt(0).toUpperCase() + prairie.dataset.slice(1) : 'Unknown';
    const safeArea = typeof prairie.area === 'number' ? prairie.area.toFixed(1) : (prairie.area || '0');
    const safeConnectivity = typeof prairie.connectivity === 'number' ? prairie.connectivity.toFixed(1) : (prairie.connectivity || '0');
    const safeSpecies = prairie.species || 0;
    const safeQuality = typeof prairie.quality === 'number' ? prairie.quality.toFixed(1) : (prairie.quality || '0');
    const safeDescription = prairie.description || 'No description available';

    return `
        <div class="popup-content">
            <h3>${safeName}</h3>
            <div class="popup-metric">
                <span>Dataset:</span>
                <strong>${safeDataset}</strong>
            </div>
            <div class="popup-metric">
                <span>Geometry:</span>
                <strong>${prairie.isPolygon ? 'Polygon' : 'Point'}</strong>
            </div>
            <div class="popup-metric">
                <span>Area:</span>
                <strong>${safeArea} hectares</strong>
            </div>
            <div class="popup-metric">
                <span>Connectivity:</span>
                <strong>${safeConnectivity}%</strong>
            </div>
            <div class="popup-metric">
                <span>Species Count:</span>
                <strong>${safeSpecies}</strong>
            </div>
            <div class="popup-metric">
                <span>Habitat Quality:</span>
                <strong>${safeQuality}%</strong>
            </div>
            <p style="margin-top: 10px; font-style: italic; color: #666;">${safeDescription}</p>
        </div>
    `;
}

// ENHANCED: Generate popup content for species observations
export function generateSpeciesPopupContent(observation) {
    const safeName = observation.species || observation.common_name || observation.name || 'Unknown Species';
    const safeScientific = observation.scientific || observation.scientific_name || 'Unknown';
    const safeCommonName = observation.common_name || observation.name || '';
    const safeDate = observation.date || observation.observed_on || 'Unknown date';
    const safeObserver = observation.observer || observation.user_login || 'Unknown observer';
    const safeQuality = observation.quality_grade || 'unknown';
    const safeCount = observation.count || 1;

    return `
        <div class="popup-content">
            <h3>${safeName}</h3>
            ${safeCommonName && safeCommonName !== safeName ? `<p><strong>Common Name:</strong> ${safeCommonName}</p>` : ''}
            <div class="popup-metric">
                <span>Scientific Name:</span>
                <strong><em>${safeScientific}</em></strong>
            </div>
            <div class="popup-metric">
                <span>Observations:</span>
                <strong>${safeCount}</strong>
            </div>
            <div class="popup-metric">
                <span>Date:</span>
                <strong>${safeDate}</strong>
            </div>
            <div class="popup-metric">
                <span>Observer:</span>
                <strong>${safeObserver}</strong>
            </div>
            <div class="popup-metric">
                <span>Quality Grade:</span>
                <strong>${safeQuality}</strong>
            </div>
            <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                Data contributed via iNaturalist citizen science platform
            </p>
        </div>
    `;
}

// FIXED: Generate popup content for connectivity corridors
export function generateCorridorPopupContent(corridor) {
    const safeName = corridor.name || corridor.id || 'Connectivity Corridor';
    const safeQuality = corridor.quality || corridor.strength || 0;
    const safeLength = corridor.length || 'Unknown';
    const safeWidth = corridor.width || 'Unknown';
    const safeType = corridor.habitat_type || corridor.type || 'Mixed habitat';
    const safeDescription = corridor.description || 'Ecological connectivity corridor for wildlife movement and gene flow.';
    
    // Handle both string and numeric quality values
    let qualityDisplay;
    if (typeof safeQuality === 'string') {
        qualityDisplay = safeQuality.charAt(0).toUpperCase() + safeQuality.slice(1);
    } else {
        qualityDisplay = `${safeQuality}%`;
    }

    return `
        <div class="popup-content">
            <h3>${safeName}</h3>
            <div class="popup-metric">
                <span>Connectivity Strength:</span>
                <strong>${qualityDisplay}</strong>
            </div>
            ${safeLength !== 'Unknown' ? `
            <div class="popup-metric">
                <span>Length:</span>
                <strong>${safeLength} km</strong>
            </div>` : ''}
            ${safeWidth !== 'Unknown' ? `
            <div class="popup-metric">
                <span>Width:</span>
                <strong>${safeWidth} m</strong>
            </div>` : ''}
            <div class="popup-metric">
                <span>Habitat Type:</span>
                <strong>${safeType}</strong>
            </div>
            <p style="margin-top: 10px; font-style: italic; color: #666;">${safeDescription}</p>
            ${corridor.isExample ? '<p style="margin-top: 5px; font-size: 0.8em; color: #888;"><em>Example/Demo Data</em></p>' : ''}
        </div>
    `;
}

// ENHANCED: Generate popup content for priority areas
export function generatePriorityAreaPopupContent(area) {
    const safeName = area.name || 'Priority Conservation Area';
    const safePriority = area.priority ? area.priority.charAt(0).toUpperCase() + area.priority.slice(1) : 'Unknown';
    const safeArea = area.area || 'Unknown';
    const safeDescription = area.description || 'Conservation priority area identified for habitat protection and restoration.';

    return `
        <div class="popup-content">
            <h3>${safeName}</h3>
            <div class="popup-metric">
                <span>Priority Level:</span>
                <strong>${safePriority}</strong>
            </div>
            ${safeArea !== 'Unknown' ? `
            <div class="popup-metric">
                <span>Area:</span>
                <strong>${safeArea} hectares</strong>
            </div>` : ''}
            <p style="margin-top: 10px; font-style: italic; color: #666;">${safeDescription}</p>
        </div>
    `;
}

// UPDATED: Calculate statistics from data including connectivity
export function calculateStats(prairieData, iNaturalistData, connectivityData, visibleLayers) {
    const visiblePrairies = visibleLayers || 0;
    const totalArea = prairieData.reduce((sum, prairie) => sum + (prairie.area || 0), 0);
    
    // Calculate unique species from iNaturalist data
    const uniqueSpecies = iNaturalistData.length > 0 ? 
        new Set(iNaturalistData.map(obs => obs.scientific || obs.species || obs.name)).size : 0;
    
    const totalObservations = iNaturalistData.reduce((sum, obs) => sum + (obs.count || 1), 0);
    
    // Calculate connectivity features
    const connectivityCount = connectivityData ? connectivityData.length : 0;
    
    return {
        prairies: visiblePrairies,
        area: totalArea.toFixed(1) + ' ha',
        connectivity: connectivityCount,
        species: uniqueSpecies,
        observations: totalObservations
    };
}

// UPDATED: Data filtering helpers for new dataset structure
export function filterPrairieData(prairieData, filters) {
    return prairieData.filter(prairie => {
        // Dataset type filter - UPDATED for new structure
        if ((prairie.dataset === 'prairies' && !filters.showPrairies) ||
            (prairie.dataset === 'example' && !filters.showExample)) {
            return false;
        }
        
        // Metric filters
        const connectivity = prairie.connectivity || 0;
        const species = prairie.species || 0;
        const area = prairie.area || 0;
        
        return connectivity >= (filters.connectivityMin || 0) && 
               species >= (filters.speciesMin || 0) &&
               area >= (filters.areaMin || 0);
    });
}

// ADDED: Filter connectivity data
export function filterConnectivityData(connectivityData, filters) {
    if (!connectivityData || connectivityData.length === 0) return [];
    
    return connectivityData.filter(corridor => {
        if (!filters.showConnectivity) return false;
        
        const strength = corridor.strength || corridor.quality || 0;
        return strength >= (filters.connectivityMin || 0);
    });
}

// ADDED: Filter iNaturalist data  
export function filterSpeciesData(speciesData, filters) {
    if (!speciesData || speciesData.length === 0) return [];
    
    return speciesData.filter(observation => {
        if (!filters.showINaturalist) return false;
        
        // Could add additional species-specific filters here
        return true;
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

// ADDED: Utility functions for data validation
export function validatePrairieData(prairie) {
    const errors = [];
    
    if (!prairie.lat || !prairie.lng) {
        errors.push('Missing coordinates');
    } else if (!validateCoordinates(prairie.lat, prairie.lng)) {
        errors.push('Coordinates outside expected range');
    }
    
    if (!prairie.name) {
        errors.push('Missing name');
    }
    
    return errors;
}

export function validateSpeciesObservation(observation) {
    const errors = [];
    
    if (!observation.lat || !observation.lng) {
        errors.push('Missing coordinates');
    }
    
    if (!observation.species && !observation.name && !observation.scientific) {
        errors.push('Missing species identification');
    }
    
    return errors;
}

// ADDED: Format utility functions
export function formatArea(area) {
    if (!area || area === 0) return '0 ha';
    if (area < 1) return `${(area * 10000).toFixed(0)} m²`;
    return `${area.toFixed(1)} ha`;
}

export function formatConnectivity(connectivity) {
    if (connectivity === null || connectivity === undefined) return 'Unknown';
    return `${connectivity.toFixed(1)}%`;
}

export function formatSpeciesCount(count) {
    if (!count || count === 0) return '0 species';
    return count === 1 ? '1 species' : `${count} species`;
}
