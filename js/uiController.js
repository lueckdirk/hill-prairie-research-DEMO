// js/uiController.js
// UI event handlers and control functions

import { getPrairieData, getINaturalistData } from './dataLoader.js';
import { getMap, getLayerGroups, addLayer, removeLayer } from './mapManager.js';
import { updatePrairieDisplay, updateSpeciesDisplay, updateConnectivityDisplay, updateHabitatDisplay, updatePriorityDisplay } from './layerRenderer.js';
import { calculateStats, debounce } from './utils.js';

// Update statistics panel
export function updateStats() {
    const layers = getLayerGroups();
    const prairieData = getPrairieData();
    const iNaturalistData = getINaturalistData();
    
    const visiblePrairies = layers.prairieLayer.getLayers().length;
    const stats = calculateStats(prairieData, iNaturalistData, visiblePrairies);
    
    document.getElementById('stat-prairies').textContent = stats.prairies;
    document.getElementById('stat-area').textContent = stats.area;
    document.getElementById('stat-species').textContent = stats.species;
    document.getElementById('stat-inaturalist').textContent = stats.observations;
}

// Debounced update function for performance
const debouncedUpdate = debounce(() => {
    const map = getMap();
    const layers = getLayerGroups();
    
    if (map.hasLayer(layers.prairieLayer)) {
        updatePrairieDisplay();
    }
    if (map.hasLayer(layers.speciesLayer)) {
        updateSpeciesDisplay();
    }
    updateStats();
}, 300);

// Setup event listeners for controls
export function setupEventListeners() {
    const map = getMap();
    const layers = getLayerGroups();

    // Layer toggles
    document.getElementById('prairies').addEventListener('change', function() {
        if (this.checked) {
            addLayer('prairieLayer');
            updatePrairieDisplay();
        } else {
            removeLayer('prairieLayer');
        }
        updateStats();
    });

    document.getElementById('connectivity').addEventListener('change', function() {
        if (this.checked) {
            addLayer('connectivityLayer');
            updateConnectivityDisplay();
        } else {
            removeLayer('connectivityLayer');
        }
    });

    document.getElementById('species').addEventListener('change', function() {
        if (this.checked) {
            addLayer('speciesLayer');
            updateSpeciesDisplay();
        } else {
            removeLayer('speciesLayer');
        }
    });

    document.getElementById('habitat').addEventListener('change', function() {
        if (this.checked) {
            addLayer('habitatLayer');
            updateHabitatDisplay();
        } else {
            removeLayer('habitatLayer');
        }
    });

    document.getElementById('priority').addEventListener('change', function() {
        if (this.checked) {
            addLayer('priorityLayer');
            updatePriorityDisplay();
        } else {
            removeLayer('priorityLayer');
        }
    });

    // Data source toggles
    ['show-example', 'show-training', 'show-validation', 'show-inaturalist'].forEach(id => {
        document.getElementById(id).addEventListener('change', debouncedUpdate);
    });

    // Filter controls with debouncing for performance
    document.getElementById('connectivity-filter').addEventListener('input', debouncedUpdate);
    document.getElementById('species-filter').addEventListener('input', debouncedUpdate);

    console.log('Event listeners setup complete');
}

// Export individual update functions for external use
export {
    updatePrairieDisplay,
    updateSpeciesDisplay,
    updateConnectivityDisplay,
    updateHabitatDisplay,
    updatePriorityDisplay
};
