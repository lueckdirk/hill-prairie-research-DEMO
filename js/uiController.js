// js/uiController.js
// UI event handlers and control functions

import { getPrairieData, getINaturalistData, getConnectivityData } from './dataLoader.js';
import { getMap, getLayerGroups, addLayer, removeLayer } from './mapManager.js';
import { updatePrairieDisplay, updateSpeciesDisplay, updateConnectivityDisplay, updateHabitatDisplay, updatePriorityDisplay } from './layerRenderer.js';
import { calculateStats, debounce } from './utils.js';

// Update statistics panel
export function updateStats() {
    const layers = getLayerGroups();
    const prairieData = getPrairieData();
    const iNaturalistData = getINaturalistData();
    const connectivityData = getConnectivityData();
    
    const visiblePrairies = layers.prairieLayer.getLayers().length;
    const visibleConnectivity = layers.connectivityLayer ? layers.connectivityLayer.getLayers().length : 0;
    const stats = calculateStats(prairieData, iNaturalistData, connectivityData, visiblePrairies);
    
    // Update all stat elements with error checking
    const statElements = {
        'stat-prairies': stats.prairies,
        'stat-area': stats.area,
        'stat-connectivity': stats.connectivity || visibleConnectivity,
        'stat-species': stats.species,
        'stat-inaturalist': stats.observations
    };

    Object.entries(statElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`Stats element ${id} not found in DOM`);
        }
    });
}

// Debounced update function for performance
const debouncedUpdate = debounce(() => {
    const map = getMap();
    const layers = getLayerGroups();
    
    if (map && layers) {
        if (map.hasLayer(layers.prairieLayer)) {
            updatePrairieDisplay();
        }
        if (map.hasLayer(layers.speciesLayer)) {
            updateSpeciesDisplay();
        }
        if (map.hasLayer(layers.connectivityLayer)) {
            updateConnectivityDisplay();
        }
        updateStats();
    }
}, 300);

// Helper function to safely add event listeners
function safeAddEventListener(elementId, event, handler) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(event, handler);
        return true;
    } else {
        console.warn(`Element ${elementId} not found, skipping event listener`);
        return false;
    }
}

// Setup event listeners for controls
export function setupEventListeners() {
    const map = getMap();
    const layers = getLayerGroups();

    // REMOVED: Old layer toggles for 'prairies', 'connectivity', 'species', 'habitat', 'priority'
    // These checkboxes don't exist in the new HTML structure
    
    // Data source toggles - UPDATED to match actual HTML IDs
    const dataSourceHandlers = {
        'show-prairies': () => {
            if (document.getElementById('show-prairies').checked) {
                addLayer('prairieLayer');
                updatePrairieDisplay();
            } else {
                removeLayer('prairieLayer');
            }
            updateStats();
        },
        'show-connectivity': () => {
            if (document.getElementById('show-connectivity').checked) {
                addLayer('connectivityLayer');
                updateConnectivityDisplay();
            } else {
                removeLayer('connectivityLayer');
            }
            updateStats();
        },
        'show-inaturalist': () => {
            if (document.getElementById('show-inaturalist').checked) {
                addLayer('speciesLayer');
                updateSpeciesDisplay();
            } else {
                removeLayer('speciesLayer');
            }
            updateStats();
        },
        'species': () => {
            if (document.getElementById('species').checked) {
                addLayer('speciesLayer');
                updateSpeciesDisplay();
            } else {
                removeLayer('speciesLayer');
            }
            updateStats();
        },
        'habitat': () => {
            if (document.getElementById('habitat').checked) {
                addLayer('habitatLayer');
                updateHabitatDisplay();
            } else {
                removeLayer('habitatLayer');
            }
        },
        'priority': () => {
            if (document.getElementById('priority').checked) {
                addLayer('priorityLayer');
                updatePriorityDisplay();
            } else {
                removeLayer('priorityLayer');
            }
        }
    };

    // Add all data source handlers
    Object.entries(dataSourceHandlers).forEach(([id, handler]) => {
        safeAddEventListener(id, 'change', handler);
    });

    // Filter controls with debouncing for performance
    const filterIds = ['connectivity-filter', 'species-filter', 'area-filter'];
    filterIds.forEach(id => {
        safeAddEventListener(id, 'input', debouncedUpdate);
    });

    console.log('Event listeners setup complete');
}

// Initialize UI state
export function initializeUI() {
    // Set default checked states
    const defaultChecked = ['show-prairies', 'show-inaturalist'];
    defaultChecked.forEach(id => {
        const element = document.getElementById(id);
        if (element && element.type === 'checkbox') {
            element.checked = true;
        }
    });

    // Initialize filter values
    const filters = ['connectivity-filter', 'species-filter', 'area-filter'];
    filters.forEach(id => {
        const element = document.getElementById(id);
        if (element && element.type === 'range') {
            element.value = element.min || 0;
        }
    });

    console.log('UI state initialized');
}

// Update filter display values (optional - shows current filter values)
export function updateFilterDisplays() {
    const filterMappings = {
        'connectivity-filter': 'connectivity-value',
        'species-filter': 'species-value', 
        'area-filter': 'area-value'
    };

    Object.entries(filterMappings).forEach(([filterId, displayId]) => {
        const filterElement = document.getElementById(filterId);
        const displayElement = document.getElementById(displayId);
        
        if (filterElement && displayElement) {
            displayElement.textContent = filterElement.value;
        }
    });
}

// Get current filter values (utility function for other modules)
export function getCurrentFilters() {
    return {
        connectivityMin: parseInt(document.getElementById('connectivity-filter')?.value || 0),
        speciesMin: parseInt(document.getElementById('species-filter')?.value || 0),
        areaMin: parseFloat(document.getElementById('area-filter')?.value || 0),
        showPrairies: document.getElementById('show-prairies')?.checked || false,
        showConnectivity: document.getElementById('show-connectivity')?.checked || false,
        showINaturalist: document.getElementById('show-inaturalist')?.checked || true
    };
}

// Force update all displays (useful for external calls)
export function forceUpdateAll() {
    updatePrairieDisplay();
    updateSpeciesDisplay();
    updateConnectivityDisplay();
    updateHabitatDisplay();
    updatePriorityDisplay();
    updateStats();
}

// Export individual update functions for external use
export {
    updatePrairieDisplay,
    updateSpeciesDisplay,
    updateConnectivityDisplay,
    updateHabitatDisplay,
    updatePriorityDisplay
};
