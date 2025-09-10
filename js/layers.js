// Hill Prairie Research Application JavaScript
const map = L.map('map').setView([43.25, -90.8], 9);

// Basemap Layer Definitions
const baseLayers = {
    osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        attribution: '© OpenStreetMap contributors' 
    }),
    esriImagery: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { 
        attribution: 'Tiles © Esri & contributors' 
    }),
    esriTopo: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', { 
        attribution: 'Tiles © Esri & contributors' 
    }),
    usgsTopo: L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', { 
        attribution: 'USGS Topographic' 
    }),
    usgsRelief: L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/tile/{z}/{y}/{x}', { 
        attribution: 'USGS Shaded Relief' 
    }),
    naip2020: L.tileLayer('https://gis.sco.wisc.edu/arcgis/rest/services/NAIP/naip_2020/ImageServer/tile/{z}/{y}/{x}', { 
        attribution: 'NAIP 2020 – USDA via SCO Wisconsin' 
    }),
    naip2022: L.tileLayer('https://gis.sco.wisc.edu/arcgis/rest/services/NAIP/naip_2022/ImageServer/tile/{z}/{y}/{x}', { 
        attribution: 'NAIP 2022 – USDA via SCO Wisconsin' 
    }),
    naip2024: L.tileLayer('https://gis.sco.wisc.edu/arcgis/rest/services/NAIP/naip_2024/ImageServer/tile/{z}/{y}/{x}', { 
        attribution: 'NAIP 2024 – USDA via SCO Wisconsin' 
    }),
    leafOff2020: L.tileLayer('https://gis.sco.wisc.edu/arcgis/rest/services/WisconsinImagery/Leaf_Off_2020/ImageServer/tile/{z}/{y}/{x}', { 
        attribution: 'Leaf-Off 2020 – SCO Wisconsin' 
    }),
    demColor: L.tileLayer('https://gis.sco.wisc.edu/arcgis/rest/services/Elevation/Colorized_DEM/ImageServer/tile/{z}/{y}/{x}', { 
        attribution: 'Colorized DEM – SCO Wisconsin' 
    }),
    slope: L.tileLayer('https://gis.sco.wisc.edu/arcgis/rest/services/Elevation/Slope/ImageServer/tile/{z}/{y}/{x}', { 
        attribution: 'Slope – SCO Wisconsin' 
    }),
    aspect: L.tileLayer('https://gis.sco.wisc.edu/arcgis/rest/services/Elevation/Aspect/ImageServer/tile/{z}/{y}/{x}', { 
        attribution: 'Aspect – SCO Wisconsin' 
    })
};

// Add default basemap and layer control
baseLayers.osm.addTo(map);
L.control.layers({
    "OpenStreetMap": baseLayers.osm,
    "Esri Satellite": baseLayers.esriImagery,
    "Esri Terrain": baseLayers.esriTopo,
    "USGS Topo": baseLayers.usgsTopo,
    "USGS Shaded Relief": baseLayers.usgsRelief,
    "NAIP 2020": baseLayers.naip2020,
    "NAIP 2022": baseLayers.naip2022,
    "Leaf-Off 2020": baseLayers.leafOff2020,
    "DEM Shaded Relief": baseLayers.demShaded,
    "Colorized DEM": baseLayers.demColor,
    "Slope": baseLayers.slope,
    "Aspect": baseLayers.aspect,
    "Hillshade": baseLayers.hillshade
}).addTo(map);

// Data storage
let prairieData = [];
let allFeatures = [];
let iNaturalistData = [];

// Layer groups
const prairieLayer = L.layerGroup();
const connectivityLayer = L.layerGroup();
const speciesLayer = L.layerGroup();
const habitatLayer = L.layerGroup();
const priorityLayer = L.layerGroup();

// Example data for demonstration
const exampleData = [
    {
        name: "Kickapoo Valley Reserve",
        lat: 43.45, lng: -90.65,
        area: 185, connectivity: 87, species: 42, quality: 95,
        description: "Large, high-quality remnant with excellent connectivity to surrounding habitats.",
        dataset: "example"
    },
    {
        name: "Governor Dodge State Park",
        lat: 43.21, lng: -90.11,
        area: 73, connectivity: 72, species: 38, quality: 88,
        description: "Well-preserved hill prairie with moderate connectivity corridor potential.",
        dataset: "example"
    },
    {
        name: "Wyalusing State Park",
        lat: 43.15, lng: -91.10,
        area: 94, connectivity: 91, species: 45, quality: 92,
        description: "Mississippi River bluff prairie with high species diversity and connectivity.",
        dataset: "example"
    },
    {
        name: "Blue Mounds State Park",
        lat: 43.04, lng: -89.85,
        area: 67, connectivity: 83, species: 41, quality: 86,
        description: "High-elevation prairie remnant with excellent native plant diversity.",
        dataset: "example"
    }
];

// Generate example iNaturalist data
const exampleSpeciesObservations = [
    { name: "Blazing Star", scientific: "Liatris pycnostachya", lat: 43.43, lng: -90.63, count: 12 },
    { name: "Prairie Rose", scientific: "Rosa arkansana", lat: 43.22, lng: -90.12, count: 8 },
    { name: "Big Bluestem", scientific: "Andropogon gerardii", lat: 43.16, lng: -91.08, count: 25 },
    { name: "Purple Coneflower", scientific: "Echinacea purpurea", lat: 43.05, lng: -89.87, count: 15 },
    { name: "Wild Bergamot", scientific: "Monarda fistulosa", lat: 43.38, lng: -90.58, count: 19 },
    { name: "Compass Plant", scientific: "Silphium laciniatum", lat: 43.24, lng: -90.14, count: 6 }
];

// Example connectivity corridors
const exampleCorridors = [
    {
        name: "Kickapoo-Coon Creek Corridor",
        coordinates: [[43.45, -90.65], [43.42, -90.70], [43.39, -90.75]],
        quality: "high"
    },
    {
        name: "Mississippi River Bluff Corridor", 
        coordinates: [[43.15, -91.10], [43.12, -91.05], [43.10, -91.00]],
        quality: "high"
    }
];

// Color functions
function getQualityColor(quality) {
    return quality > 80 ? '#155724' :
           quality > 60 ? '#28a745' :
           quality > 40 ? '#856404' : '#721c24';
}

function getDatasetColor(dataset) {
    switch(dataset) {
        case 'training': return '#28a745';
        case 'validation': return '#9c27b0';
        case 'example': return '#ff9800';
        default: return '#6c757d';
    }
}

function getConnectivityColor(connectivity) {
    return connectivity > 70 ? '#28a745' :
           connectivity > 40 ? '#ffc107' : '#dc3545';
}

// Error handling
function showError(message) {
    const errorContainer = document.getElementById('error-container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<strong>Data Loading Issue:</strong> ${message}`;
    errorContainer.appendChild(errorDiv);
}

// Loading indicator
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

// Load GeoJSON data
async function loadGeoJSONData() {
    showLoading(true);
    let loadedDatasets = [];
    
    try {
        // Define all possible data files to check
        const dataFiles = [
            { file: 'data/training_features.geojson', type: 'training', label: 'Training Features' },
            { file: 'data/validation_features.geojson', type: 'validation', label: 'Validation Features' },
            { file: 'data/connectivity_results.geojson', type: 'connectivity', label: 'Connectivity Data' }
        ];

        // Try to load each data file
        for (const dataFile of dataFiles) {
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
        prairieData.push(...exampleData);
        iNaturalistData.push(...exampleSpeciesObservations);
        console.log(`📊 Total prairie sites loaded: ${prairieData.length}`);

        // Update UI based on what was loaded
        updateDataSourceControls(loadedDatasets);
        
    } catch (error) {
        console.error('❌ Critical error loading GeoJSON data:', error);
        showError('Critical error loading research data files. Using example data only.');
        prairieData = [...exampleData];
        iNaturalistData = [...exampleSpeciesObservations];
    }
    
    showLoading(false);
}

// Process location features (training/validation sites)
function processLocationFeatures(data, datasetType) {
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
function processConnectivityFeatures(data) {
    console.log(`Processing ${data.features.length} connectivity features`);
    // This will be used to populate connectivity layers
    data.features.forEach((feature, index) => {
        if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
            console.log(`Connectivity feature ${index}:`, feature.properties);
        }
    });
}

// Update data source controls based on what was successfully loaded
function updateDataSourceControls(loadedDatasets) {
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

// Update display functions
function updatePrairieDisplay() {
    const connectivityMin = document.getElementById('connectivity-filter').value;
    const speciesMin = document.getElementById('species-filter').value;
    const showTraining = document.getElementById('show-training').checked;
    const showValidation = document.getElementById('show-validation').checked;
    const showExample = document.getElementById('show-example').checked;
    
    prairieLayer.clearLayers();
    
    prairieData.forEach(prairie => {
        // Filter by dataset type
        if ((prairie.dataset === 'training' && !showTraining) ||
            (prairie.dataset === 'validation' && !showValidation) ||
            (prairie.dataset === 'example' && !showExample)) {
            return;
        }
        
        // Filter by metrics
        if (prairie.connectivity >= connectivityMin && prairie.species >= speciesMin) {
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

            const popupContent = `
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

            marker.bindPopup(popupContent);
            marker.addTo(prairieLayer);
        }
    });
    
    updateStats();
}

// Update connectivity corridors display
function updateConnectivityDisplay() {
    connectivityLayer.clearLayers();
    
    exampleCorridors.forEach(corridor => {
        const color = corridor.quality === 'high' ? '#28a745' : 
                     corridor.quality === 'medium' ? '#ffc107' : '#dc3545';
        
        const polyline = L.polyline(corridor.coordinates, {
            color: color,
            weight: 4,
            opacity: 0.8
        });
        
        polyline.bindPopup(`
            <div class="popup-content">
                <h3>${corridor.name}</h3>
                <div class="popup-metric">
                    <span>Quality:</span>
                    <strong>${corridor.quality.charAt(0).toUpperCase() + corridor.quality.slice(1)}</strong>
                </div>
            </div>
        `);
        
        polyline.addTo(connectivityLayer);
    });
}

// Update species observations display
function updateSpeciesDisplay() {
    const showINaturalist = document.getElementById('show-inaturalist').checked;
    speciesLayer.clearLayers();
    
    if (showINaturalist) {
        iNaturalistData.forEach(observation => {
            const marker = L.circleMarker([observation.lat, observation.lng], {
                radius: 4,
                fillColor: '#74ac00',
                color: '#4a6b00',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
            
            marker.bindPopup(`
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
            `);
            
            marker.addTo(speciesLayer);
        });
    }
}

// Update habitat suitability display
function updateHabitatDisplay() {
    habitatLayer.clearLayers();
    
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
    
    imageOverlay.addTo(habitatLayer);
}

// Update conservation priority areas
function updatePriorityDisplay() {
    priorityLayer.clearLayers();
    
    // Example priority polygons
    const priorityAreas = [
        {
            name: "High Priority Conservation Area",
            coordinates: [[43.4, -90.7], [43.45, -90.65], [43.42, -90.6], [43.37, -90.65]],
            priority: "high"
        },
        {
            name: "Medium Priority Conservation Area", 
            coordinates: [[43.2, -90.15], [43.25, -90.1], [43.22, -90.05], [43.17, -90.1]],
            priority: "medium"
        }
    ];
    
    priorityAreas.forEach(area => {
        const color = area.priority === 'high' ? '#dc3545' : 
                     area.priority === 'medium' ? '#ffc107' : '#28a745';
        
        const polygon = L.polygon(area.coordinates, {
            color: color,
            weight: 2,
            opacity: 0.8,
            fillColor: color,
            fillOpacity: 0.2
        });
        
        polygon.bindPopup(`
            <div class="popup-content">
                <h3>${area.name}</h3>
                <div class="popup-metric">
                    <span>Priority Level:</span>
                    <strong>${area.priority.charAt(0).toUpperCase() + area.priority.slice(1)}</strong>
                </div>
            </div>
        `);
        
        polygon.addTo(priorityLayer);
    });
}

// Update statistics panel
function updateStats() {
    const visiblePrairies = prairieLayer.getLayers().length;
    const totalArea = prairieData.reduce((sum, prairie) => sum + (prairie.area || 0), 0);
    const uniqueSpecies = new Set(iNaturalistData.map(obs => obs.scientific)).size;
    const totalObservations = iNaturalistData.reduce((sum, obs) => sum + obs.count, 0);
    
    document.getElementById('stat-prairies').textContent = visiblePrairies;
    document.getElementById('stat-area').textContent = totalArea.toFixed(1) + ' ha';
    document.getElementById('stat-species').textContent = uniqueSpecies;
    document.getElementById('stat-inaturalist').textContent = totalObservations;
}

// Event listeners for controls
function setupEventListeners() {
    // Layer toggles
    document.getElementById('prairies').addEventListener('change', function() {
        if (this.checked) {
            map.addLayer(prairieLayer);
            updatePrairieDisplay();
        } else {
            map.removeLayer(prairieLayer);
        }
    });

    document.getElementById('connectivity').addEventListener('change', function() {
        if (this.checked) {
            map.addLayer(connectivityLayer);
            updateConnectivityDisplay();
        } else {
            map.removeLayer(connectivityLayer);
        }
    });

    document.getElementById('species').addEventListener('change', function() {
        if (this.checked) {
            map.addLayer(speciesLayer);
            updateSpeciesDisplay();
        } else {
            map.removeLayer(speciesLayer);
        }
    });

    document.getElementById('habitat').addEventListener('change', function() {
        if (this.checked) {
            map.addLayer(habitatLayer);
            updateHabitatDisplay();
        } else {
            map.removeLayer(habitatLayer);
        }
    });

    document.getElementById('priority').addEventListener('change', function() {
        if (this.checked) {
            map.addLayer(priorityLayer);
            updatePriorityDisplay();
        } else {
            map.removeLayer(priorityLayer);
        }
    });

    // Data source toggles
    ['show-example', 'show-training', 'show-validation', 'show-inaturalist'].forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            if (document.getElementById('prairies').checked) {
                updatePrairieDisplay();
            }
            if (document.getElementById('species').checked) {
                updateSpeciesDisplay();
            }
        });
    });

    // Filter controls
    document.getElementById('connectivity-filter').addEventListener('input', function() {
        if (document.getElementById('prairies').checked) {
            updatePrairieDisplay();
        }
    });

    document.getElementById('species-filter').addEventListener('input', function() {
        if (document.getElementById('prairies').checked) {
            updatePrairieDisplay();
        }
    });
}

// Initialize the application
async function initialize() {
    console.log('🌿 Initializing Hill Prairie Research Application');
    
    // Load data
    await loadGeoJSONData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize default layers
    map.addLayer(prairieLayer);
    updatePrairieDisplay();
    
    console.log('✅ Application initialized successfully');
}

// Start the application
initialize().catch(error => {
    console.error('❌ Failed to initialize application:', error);
    showError('Failed to initialize application. Please refresh the page.');
});
