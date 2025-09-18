// js/app.js
// Main application initialization and coordination

import { MAP_CONFIG, TILE_LAYERS, COLORS } from './config.js';
import { loadGeoJSONData, getPrairieData, getINaturalistData } from './dataLoader.js';
import { initializeMap, getMap, getLayerGroups } from './mapManager.js';
import { updateAllLayers } from './layerRenderer.js';
import { setupEventListeners, updateStats } from './uiController.js';

// Global application state
let app = {
    map: null,
    layers: {},
    initialized: false
};

// Initialize the application
async function initialize() {
    console.log('Hill Prairie Research Application - Demo Version');
    
    try {
        // Step 1: Initialize the map
        app.map = initializeMap();
        app.layers = getLayerGroups();
        console.log('✅ Map initialized');

        // Step 2: Load data
        await loadGeoJSONData();
        console.log('✅ Data loaded');
        
        // Step 3: Setup UI event listeners
        setupEventListeners();
        console.log('✅ Event listeners setup');
        
        // Step 4: Initialize default layers
        app.map.addLayer(app.layers.prairieLayer);
        updateAllLayers();
        updateStats();
        console.log('✅ Default layers initialized');
        
        app.initialized = true;
        console.log('Application initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        const errorContainer = document.getElementById('error-container');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<strong>Initialization Error:</strong> Failed to initialize application. Please refresh the page.`;
        errorContainer.appendChild(errorDiv);
    }
}

// Export for potential debugging access
window.hillPrairieApp = app;

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
