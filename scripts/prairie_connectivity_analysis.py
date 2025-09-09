# QGIS Prairie Connectivity Analysis Tool
# Run this script from the QGIS Python Console or as a Processing Script

import os
import sys
from qgis.core import *
from qgis.gui import *
from qgis.utils import *
from qgis.PyQt.QtCore import *
from qgis.PyQt.QtGui import *
from qgis.PyQt.QtWidgets import *

import processing
import numpy as np
import pandas as pd
from scipy.spatial.distance import cdist
import networkx as nx
from shapely.geometry import LineString, Point
import json
from datetime import datetime

# ============================================================================
# CONNECTIVITY ANALYSIS PARAMETERS - ADJUST THESE EASILY
# ============================================================================

# Primary connectivity parameters
DEFAULT_MAX_DISTANCE_KM = 2.0      # Maximum connection distance (km)
DEFAULT_MIN_PRIMARY_SIZE_HA = 0.5   # Minimum size for primary nodes (ha)
DEFAULT_MIN_SECONDARY_SIZE_HA = 0.1  # Minimum size for secondary nodes (ha)
DEFAULT_CORRIDOR_WIDTH_M = 500      # Corridor width for visualization (m)

# ============================================================================

class PrairieConnectivityQGIS:
    """QGIS-integrated prairie connectivity analyzer"""
    
    def __init__(self):
        self.network = None
        self.patches_df = None
        self.crs = None
        
    def analyze_layer_connectivity(self, layer, max_distance_km=DEFAULT_MAX_DISTANCE_KM,
                                 min_primary_size_ha=DEFAULT_MIN_PRIMARY_SIZE_HA,
                                 min_secondary_size_ha=DEFAULT_MIN_SECONDARY_SIZE_HA,
                                 area_field=None):
        """
        Analyze connectivity of features in a QGIS layer
        
        Args:
            layer: QGIS vector layer with prairie patches
            max_distance_km: Maximum connection distance
            min_primary_size_ha: Minimum size for primary nodes
            min_secondary_size_ha: Minimum size for secondary nodes
            area_field: Field name containing area in hectares (if None, will calculate)
        """
        
        if not layer.isValid():
            raise ValueError("Invalid layer provided")
            
        print(f"Analyzing {layer.featureCount()} features from layer: {layer.name()}")
        
        # Get CRS and check if it's projected
        self.crs = layer.crs()
        if self.crs.isGeographic():
            print("Warning: Layer uses geographic CRS. Results may be less accurate.")
            print("Consider reprojecting to a suitable projected CRS first.")
        
        # Extract features to pandas DataFrame
        features_data = []
        
        for i, feature in enumerate(layer.getFeatures()):
            geom = feature.geometry()
            
            if geom.isEmpty():
                continue
                
            # Calculate area if not provided
            if area_field and area_field in [field.name() for field in layer.fields()]:
                area_ha = feature[area_field]
                if area_ha is None:
                    area_ha = 0
            else:
                # Calculate area (convert to hectares based on CRS)
                if self.crs.isGeographic():
                    # For geographic CRS, use a rough approximation
                    area_m2 = geom.area() * (111000 ** 2)  # Very rough approximation
                else:
                    area_m2 = geom.area()
                area_ha = area_m2 / 10000
            
            # Get centroid
            centroid = geom.centroid().asPoint()
            
            # Convert to projected coordinates if geographic
            if self.crs.isGeographic():
                # Convert to approximate meters for distance calculations
                centroid_x = centroid.x() * 111000 * np.cos(np.radians(centroid.y()))
                centroid_y = centroid.y() * 111000
            else:
                centroid_x = centroid.x()
                centroid_y = centroid.y()
            
            features_data.append({
                'patch_id': f'patch_{i}',
                'fid': feature.id(),
                'area_ha': area_ha,
                'centroid_x': centroid_x,
                'centroid_y': centroid_y,
                'geometry': geom,
                'centroid_point': centroid  # Store the QgsPointXY directly
            })
        
        if not features_data:
            raise ValueError("No valid features found in layer")
            
        self.patches_df = pd.DataFrame(features_data)
        
        # Classify node types
        self.patches_df['node_type'] = 'too_small'
        self.patches_df.loc[self.patches_df['area_ha'] >= min_secondary_size_ha, 'node_type'] = 'secondary'
        self.patches_df.loc[self.patches_df['area_ha'] >= min_primary_size_ha, 'node_type'] = 'primary'
        
        # Filter patches
        initial_count = len(self.patches_df)
        self.patches_df = self.patches_df[self.patches_df['area_ha'] >= min_secondary_size_ha]
        
        print(f"Filtered to {len(self.patches_df)} patches (removed {initial_count - len(self.patches_df)} too small)")
        print(f"Primary nodes: {sum(self.patches_df['node_type'] == 'primary')}")
        print(f"Secondary nodes: {sum(self.patches_df['node_type'] == 'secondary')}")
        
        if len(self.patches_df) == 0:
            raise ValueError("No patches meet minimum size criteria")
        
        # Build network
        self._build_network(max_distance_km * 1000)  # Convert to meters
        
        return self._calculate_metrics()
    
    def _build_network(self, max_distance_m):
        """Build connectivity network"""
        
        print("Building connectivity network...")
        
        # Extract coordinates
        coords = np.array(list(zip(self.patches_df['centroid_x'], 
                                  self.patches_df['centroid_y'])))
        
        # Calculate distance matrix
        distances = cdist(coords, coords)
        
        # Create network
        self.network = nx.Graph()
        
        # Add nodes
        for _, row in self.patches_df.iterrows():
            self.network.add_node(
                row['patch_id'],
                area_ha=row['area_ha'],
                node_type=row['node_type'],
                fid=row['fid'],
                centroid=(row['centroid_x'], row['centroid_y'])
            )
        
        # Add edges
        patch_ids = self.patches_df['patch_id'].tolist()
        connections_added = 0
        
        for i in range(len(patch_ids)):
            for j in range(i + 1, len(patch_ids)):
                distance = distances[i, j]
                
                if distance <= max_distance_m and distance > 0:
                    area1 = self.patches_df.iloc[i]['area_ha']
                    area2 = self.patches_df.iloc[j]['area_ha']
                    
                    self.network.add_edge(
                        patch_ids[i], patch_ids[j],
                        distance_m=distance,
                        distance_km=distance/1000,
                        weight=np.sqrt(area1 * area2) / distance  # Area-weighted
                    )
                    connections_added += 1
        
        print(f"Created network: {len(self.network.nodes)} nodes, {connections_added} connections")
    
    def _calculate_metrics(self):
        """Calculate connectivity metrics"""
        
        if self.network is None:
            return {}
        
        # Basic metrics
        metrics = {
            'total_patches': len(self.network.nodes),
            'total_connections': len(self.network.edges),
            'network_density': nx.density(self.network),
            'primary_nodes': sum(1 for _, data in self.network.nodes(data=True) 
                               if data['node_type'] == 'primary'),
            'secondary_nodes': sum(1 for _, data in self.network.nodes(data=True) 
                                 if data['node_type'] == 'secondary')
        }
        
        # Connected components
        components = list(nx.connected_components(self.network))
        metrics['num_components'] = len(components)
        metrics['largest_component_size'] = len(max(components, key=len)) if components else 0
        metrics['isolated_patches'] = sum(1 for comp in components if len(comp) == 1)
        
        # Node-level metrics
        degree_centrality = nx.degree_centrality(self.network)
        betweenness_centrality = nx.betweenness_centrality(self.network)
        
        # Add to dataframe
        self.patches_df['degree_centrality'] = [degree_centrality.get(pid, 0) 
                                               for pid in self.patches_df['patch_id']]
        self.patches_df['betweenness_centrality'] = [betweenness_centrality.get(pid, 0) 
                                                   for pid in self.patches_df['patch_id']]
        self.patches_df['num_connections'] = [self.network.degree(pid) 
                                            for pid in self.patches_df['patch_id']]
        
        # Connection statistics
        metrics['avg_connections_per_patch'] = np.mean(self.patches_df['num_connections'])
        metrics['max_connections'] = np.max(self.patches_df['num_connections'])
        
        # Area statistics
        metrics['total_area_ha'] = self.patches_df['area_ha'].sum()
        
        return metrics
    
    def create_qgis_layers(self, layer_prefix="Prairie_Connectivity"):
        """Create QGIS layers with connectivity results"""
        
        if self.patches_df is None or self.network is None:
            raise ValueError("Must run analysis first")
        
        layers_created = []
        
        # 1. Enhanced patches layer
        patches_layer = self._create_patches_layer(f"{layer_prefix}_Patches")
        if patches_layer:
            layers_created.append(patches_layer)
        
        # 2. Connections layer
        connections_layer = self._create_connections_layer(f"{layer_prefix}_Connections")
        if connections_layer:
            layers_created.append(connections_layer)
        
        # 3. Priority patches layer
        priority_layer = self._create_priority_patches_layer(f"{layer_prefix}_Priority_Patches")
        if priority_layer:
            layers_created.append(priority_layer)
        
        return layers_created
    
    def _create_patches_layer(self, layer_name):
        """Create enhanced patches layer with connectivity metrics"""
        
        # Create memory layer
        layer = QgsVectorLayer(f"Polygon?crs={self.crs.authid()}", layer_name, "memory")
        provider = layer.dataProvider()
        
        # Add fields
        fields = [
            QgsField("patch_id", QVariant.String),
            QgsField("area_ha", QVariant.Double),
            QgsField("node_type", QVariant.String),
            QgsField("num_connections", QVariant.Int),
            QgsField("degree_centrality", QVariant.Double),
            QgsField("betweenness_centrality", QVariant.Double),
            QgsField("is_hub", QVariant.Bool),
            QgsField("is_isolated", QVariant.Bool)
        ]
        provider.addAttributes(fields)
        layer.updateFields()
        
        # Add features
        features = []
        for _, row in self.patches_df.iterrows():
            feature = QgsFeature()
            feature.setGeometry(row['geometry'])
            
            # Identify hubs and isolated patches
            is_hub = (row['degree_centrality'] > self.patches_df['degree_centrality'].quantile(0.8) and
                     row['area_ha'] > self.patches_df['area_ha'].quantile(0.6))
            is_isolated = row['num_connections'] == 0
            
            feature.setAttributes([
                row['patch_id'],
                row['area_ha'],
                row['node_type'],
                row['num_connections'],
                row['degree_centrality'],
                row['betweenness_centrality'],
                is_hub,
                is_isolated
            ])
            features.append(feature)
        
        provider.addFeatures(features)
        layer.updateExtents()
        
        # Apply styling
        self._style_patches_layer(layer)
        
        # Add to map
        QgsProject.instance().addMapLayer(layer)
        print(f"Created patches layer: {layer_name}")
        
        return layer
    
    def _create_connections_layer(self, layer_name):
        """Create connections layer"""
        
        layer = QgsVectorLayer(f"LineString?crs={self.crs.authid()}", layer_name, "memory")
        provider = layer.dataProvider()
        
        # Add fields
        fields = [
            QgsField("patch_1", QVariant.String),
            QgsField("patch_2", QVariant.String),
            QgsField("distance_km", QVariant.Double),
            QgsField("weight", QVariant.Double),
            QgsField("connection_type", QVariant.String)
        ]
        provider.addAttributes(fields)
        layer.updateFields()
        
        # Add connection features
        features = []
        for edge in self.network.edges(data=True):
            node1, node2 = edge[0], edge[1]
            edge_data = edge[2]
            
            # Get centroids - FIX: Access QgsPointXY objects directly
            centroid1 = self.patches_df[self.patches_df['patch_id'] == node1]['centroid_point'].iloc[0]
            centroid2 = self.patches_df[self.patches_df['patch_id'] == node2]['centroid_point'].iloc[0]
            
            # Create line geometry - QgsPointXY objects can be used directly
            points = [centroid1, centroid2]
            line_geom = QgsGeometry.fromPolylineXY(points)
            
            # Get node types for connection classification
            type1 = self.network.nodes[node1]['node_type']
            type2 = self.network.nodes[node2]['node_type']
            connection_type = f"{type1}-{type2}"
            
            feature = QgsFeature()
            feature.setGeometry(line_geom)
            feature.setAttributes([
                node1, node2,
                edge_data['distance_km'],
                edge_data['weight'],
                connection_type
            ])
            features.append(feature)
        
        provider.addFeatures(features)
        layer.updateExtents()
        
        # Apply styling
        self._style_connections_layer(layer)
        
        # Add to map
        QgsProject.instance().addMapLayer(layer)
        print(f"Created connections layer: {layer_name}")
        
        return layer
    
    def _create_priority_patches_layer(self, layer_name):
        """Create layer highlighting priority patches"""
        
        # Identify priority patches (hubs + large isolated)
        priority_patches = self.patches_df[
            ((self.patches_df['degree_centrality'] > self.patches_df['degree_centrality'].quantile(0.8)) &
             (self.patches_df['area_ha'] > self.patches_df['area_ha'].quantile(0.6))) |
            ((self.patches_df['num_connections'] == 0) & 
             (self.patches_df['area_ha'] > self.patches_df['area_ha'].quantile(0.7)))
        ]
        
        if len(priority_patches) == 0:
            print("No priority patches identified")
            return None
        
        layer = QgsVectorLayer(f"Polygon?crs={self.crs.authid()}", layer_name, "memory")
        provider = layer.dataProvider()
        
        # Add fields
        fields = [
            QgsField("patch_id", QVariant.String),
            QgsField("area_ha", QVariant.Double),
            QgsField("priority_type", QVariant.String),
            QgsField("num_connections", QVariant.Int),
            QgsField("degree_centrality", QVariant.Double)
        ]
        provider.addAttributes(fields)
        layer.updateFields()
        
        # Add features
        features = []
        for _, row in priority_patches.iterrows():
            feature = QgsFeature()
            feature.setGeometry(row['geometry'])
            
            # Determine priority type
            if row['num_connections'] == 0:
                priority_type = "Large Isolated"
            else:
                priority_type = "Hub"
            
            feature.setAttributes([
                row['patch_id'],
                row['area_ha'],
                priority_type,
                row['num_connections'],
                row['degree_centrality']
            ])
            features.append(feature)
        
        provider.addFeatures(features)
        layer.updateExtents()
        
        # Apply styling
        self._style_priority_layer(layer)
        
        # Add to map
        QgsProject.instance().addMapLayer(layer)
        print(f"Created priority patches layer: {layer_name} ({len(priority_patches)} patches)")
        
        return layer
    
    def _style_patches_layer(self, layer):
        """Apply styling to patches layer"""
        
        # Create categorized renderer based on node type
        categories = []
        
        # Primary nodes - red
        primary_symbol = QgsSymbol.defaultSymbol(layer.geometryType())
        primary_symbol.setColor(QColor(255, 0, 0))  # Red
        primary_symbol.setOpacity(0.7)
        categories.append(QgsRendererCategory('primary', primary_symbol, 'Primary Nodes'))
        
        # Secondary nodes - blue  
        secondary_symbol = QgsSymbol.defaultSymbol(layer.geometryType())
        secondary_symbol.setColor(QColor(0, 0, 255))  # Blue
        secondary_symbol.setOpacity(0.7)
        categories.append(QgsRendererCategory('secondary', secondary_symbol, 'Secondary Nodes'))
        
        renderer = QgsCategorizedSymbolRenderer('node_type', categories)
        layer.setRenderer(renderer)
        
        # Add labels for patch IDs
        label_settings = QgsPalLayerSettings()
        label_settings.fieldName = 'patch_id'
        label_settings.enabled = False  # Start disabled to avoid clutter
        
        label_settings.setFormat(QgsTextFormat())
        labeling = QgsVectorLayerSimpleLabeling(label_settings)
        layer.setLabelsEnabled(False)
        layer.setLabeling(labeling)
    
    def _style_connections_layer(self, layer):
        """Apply styling to connections layer"""
        
        # Create graduated renderer based on distance
        renderer = QgsGraduatedSymbolRenderer()
        renderer.setClassAttribute('distance_km')
        
        # Create symbol
        symbol = QgsSymbol.defaultSymbol(layer.geometryType())
        symbol.setColor(QColor(100, 100, 100))
        symbol.setOpacity(0.6)
        
        renderer.setSourceSymbol(symbol)
        renderer.setMode(QgsGraduatedSymbolRenderer.EqualInterval)
        renderer.updateClasses(layer, 3)  # 3 classes
        
        layer.setRenderer(renderer)
    
    def _style_priority_layer(self, layer):
        """Apply styling to priority patches layer"""
        
        # Create categorized renderer
        categories = []
        
        # Hub patches - yellow stars
        hub_symbol = QgsSymbol.defaultSymbol(layer.geometryType())
        hub_symbol.setColor(QColor(255, 255, 0))  # Yellow
        hub_symbol.setOpacity(0.8)
        categories.append(QgsRendererCategory('Hub', hub_symbol, 'Hub Patches'))
        
        # Isolated patches - orange
        isolated_symbol = QgsSymbol.defaultSymbol(layer.geometryType())
        isolated_symbol.setColor(QColor(255, 165, 0))  # Orange
        isolated_symbol.setOpacity(0.8)
        categories.append(QgsRendererCategory('Large Isolated', isolated_symbol, 'Large Isolated'))
        
        renderer = QgsCategorizedSymbolRenderer('priority_type', categories)
        layer.setRenderer(renderer)

# ============================================================================
# DIALOG FOR USER INTERFACE
# ============================================================================

class PrairieConnectivityDialog(QDialog):
    """Dialog for prairie connectivity analysis parameters"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Prairie Connectivity Analysis")
        self.setMinimumWidth(400)
        self.setup_ui()
        
    def setup_ui(self):
        layout = QVBoxLayout()
        
        # Layer selection
        layout.addWidget(QLabel("Select Prairie Patches Layer:"))
        self.layer_combo = QgsMapLayerComboBox()
        self.layer_combo.setFilters(QgsMapLayerProxyModel.PolygonLayer)
        layout.addWidget(self.layer_combo)
        
        # Area field selection
        layout.addWidget(QLabel("Area Field (optional, will calculate if empty):"))
        self.area_field_combo = QgsFieldComboBox()
        self.area_field_combo.setAllowEmptyFieldName(True)
        layout.addWidget(self.area_field_combo)
        
        # Connect layer change to field combo update
        self.layer_combo.layerChanged.connect(self.area_field_combo.setLayer)
        
        # Parameters group
        params_group = QGroupBox("Analysis Parameters")
        params_layout = QFormLayout()
        
        self.max_distance_spin = QDoubleSpinBox()
        self.max_distance_spin.setRange(0.1, 50.0)
        self.max_distance_spin.setValue(DEFAULT_MAX_DISTANCE_KM)
        self.max_distance_spin.setSuffix(" km")
        self.max_distance_spin.setDecimals(1)
        params_layout.addRow("Max Connection Distance:", self.max_distance_spin)
        
        self.primary_size_spin = QDoubleSpinBox()
        self.primary_size_spin.setRange(0.01, 1000.0)
        self.primary_size_spin.setValue(DEFAULT_MIN_PRIMARY_SIZE_HA)
        self.primary_size_spin.setSuffix(" ha")
        self.primary_size_spin.setDecimals(2)
        params_layout.addRow("Primary Node Min Size :", self.primary_size_spin)
        
        self.secondary_size_spin = QDoubleSpinBox()
        self.secondary_size_spin.setRange(0.01, 1000.0)
        self.secondary_size_spin.setValue(DEFAULT_MIN_SECONDARY_SIZE_HA)
        self.secondary_size_spin.setSuffix(" ha")
        self.secondary_size_spin.setDecimals(2)
        params_layout.addRow("Secondary Node Min Size:", self.secondary_size_spin)
        
        # Add italicized note at the bottom
        note_label = QLabel("Note: ~1.6 km = 1 mi, ~0.4 ha = 1 ac")
        note_label.setStyleSheet("font-style: italic; color: #666666; font-size: 10px;")
        note_label.setAlignment(Qt.AlignCenter)

        # Create a vertical layout to include the form and the note
        params_container_layout = QVBoxLayout()
        params_container_layout.addLayout(params_layout)
        params_container_layout.addWidget(note_label)

        params_group.setLayout(params_container_layout)
        layout.addWidget(params_group)
        
        # Output options
        output_group = QGroupBox("Output Options")
        output_layout = QVBoxLayout()
        
        self.create_connections_check = QCheckBox("Create Connections Layer")
        self.create_connections_check.setChecked(True)
        output_layout.addWidget(self.create_connections_check)
        
        self.create_priority_check = QCheckBox("Create Priority Patches Layer")
        self.create_priority_check.setChecked(True)
        output_layout.addWidget(self.create_priority_check)
        
        self.layer_prefix_edit = QLineEdit("Prairie_Connectivity")
        output_layout.addWidget(QLabel("Layer Name Prefix:"))
        output_layout.addWidget(self.layer_prefix_edit)
        
        output_group.setLayout(output_layout)
        layout.addWidget(output_group)
        
        # Buttons
        button_layout = QHBoxLayout()
        
        self.run_button = QPushButton("Run Analysis")
        self.run_button.clicked.connect(self.run_analysis)
        button_layout.addWidget(self.run_button)
        
        self.close_button = QPushButton("Close")
        self.close_button.clicked.connect(self.close)
        button_layout.addWidget(self.close_button)
        
        layout.addLayout(button_layout)
        
        # Status label
        self.status_label = QLabel("")
        layout.addWidget(self.status_label)
        
        self.setLayout(layout)
    
    def run_analysis(self):
        """Run the connectivity analysis"""
        
        layer = self.layer_combo.currentLayer()
        if not layer:
            self.status_label.setText("Please select a layer")
            return
        
        self.status_label.setText("Running analysis...")
        self.run_button.setEnabled(False)
        
        try:
            # Get parameters
            max_distance = self.max_distance_spin.value()
            primary_size = self.primary_size_spin.value()
            secondary_size = self.secondary_size_spin.value()
            area_field = self.area_field_combo.currentField()
            layer_prefix = self.layer_prefix_edit.text()
            
            if not area_field:
                area_field = None
            
            # Run analysis
            analyzer = PrairieConnectivityQGIS()
            metrics = analyzer.analyze_layer_connectivity(
                layer=layer,
                max_distance_km=max_distance,
                min_primary_size_ha=primary_size,
                min_secondary_size_ha=secondary_size,
                area_field=area_field
            )
            
            # Create output layers
            layers_created = analyzer.create_qgis_layers(layer_prefix)
            
            # Show results dialog
            self.show_results(metrics, layers_created)
            
            self.status_label.setText("Analysis completed successfully!")
            
        except Exception as e:
            self.status_label.setText(f"Error: {str(e)}")
            print(f"Analysis error: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            self.run_button.setEnabled(True)
    
    def show_results(self, metrics, layers_created):
        """Show analysis results"""
        
        results_text = f"""
Analysis Results:

Network Metrics:
• Total patches: {metrics['total_patches']}
• Primary nodes: {metrics['primary_nodes']}  
• Secondary nodes: {metrics['secondary_nodes']}
• Total connections: {metrics['total_connections']}
• Network density: {metrics['network_density']:.3f}

Connectivity:
• Connected components: {metrics['num_components']}
• Largest component: {metrics['largest_component_size']} patches
• Isolated patches: {metrics['isolated_patches']}
• Average connections per patch: {metrics['avg_connections_per_patch']:.1f}

Area:
• Total prairie area: {metrics['total_area_ha']:.1f} hectares

Layers Created:
""" + "\n".join([f"• {layer.name()}" for layer in layers_created])

        QMessageBox.information(self, "Analysis Results", results_text)

# ============================================================================
# MAIN FUNCTIONS TO RUN FROM QGIS
# ============================================================================

def run_prairie_connectivity_dialog():
    """Open the prairie connectivity analysis dialog"""
    dialog = PrairieConnectivityDialog()
    dialog.exec_()

def quick_prairie_analysis(layer_name=None, max_distance_km=2.0, min_size_ha=0.5):
    """
    Quick analysis function for QGIS Python console
    
    Usage from QGIS Python console:
    exec(open('path/to/this/script.py').read())
    quick_prairie_analysis('your_layer_name', max_distance_km=3.0, min_size_ha=1.0)
    """
    
    # Get layer
    if layer_name:
        layer = QgsProject.instance().mapLayersByName(layer_name)
        if not layer:
            print(f"Layer '{layer_name}' not found")
            return
        layer = layer[0]
    else:
        # Use active layer
        layer = iface.activeLayer()
        if not layer:
            print("No active layer selected")
            return
    
    print(f"Running quick analysis on layer: {layer.name()}")
    
    try:
        analyzer = PrairieConnectivityQGIS()
        metrics = analyzer.analyze_layer_connectivity(
            layer=layer,
            max_distance_km=max_distance_km,
            min_primary_size_ha=min_size_ha,
            min_secondary_size_ha=min_size_ha * 0.5
        )
        
        # Create layers
        layers_created = analyzer.create_qgis_layers("Quick_Prairie_Analysis")
        
        print("\n" + "="*50)
        print("ANALYSIS RESULTS")
        print("="*50)
        print(f"Total patches: {metrics['total_patches']}")
        print(f"Connections: {metrics['total_connections']}")  
        print(f"Components: {metrics['num_components']}")
        print(f"Isolated patches: {metrics['isolated_patches']}")
        print(f"Total area: {metrics['total_area_ha']:.1f} ha")
        print("="*50)
        
        return analyzer, metrics
        
    except Exception as e:
        print(f"Analysis failed: {e}")
        import traceback
        traceback.print_exc()

# ============================================================================
# AUTO-RUN WHEN SCRIPT IS EXECUTED
# ============================================================================

if __name__ == "__main__" or "iface" in globals():
    # This will run when the script is executed in QGIS
    print("Prairie Connectivity Analysis for QGIS loaded!")
    print("\nTo use:")
    print("1. run_prairie_connectivity_dialog() - Opens full dialog")
    print("2. quick_prairie_analysis('layer_name') - Quick analysis")
    print("\nExample:")
    print("quick_prairie_analysis('prairie_patches', max_distance_km=3.0, min_size_ha=1.0)")
    
    # Uncomment the next line to automatically open the dialog
    run_prairie_connectivity_dialog()
