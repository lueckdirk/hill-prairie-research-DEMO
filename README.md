markdown# Hill Prairie Research: Connectivity and Conservation in the Driftless Region

## Project Overview
This research analyzes remnant hill prairie ecosystems in the Driftless Region, focusing on landscape connectivity, species distributions, and conservation prioritization. The project integrates machine learning habitat suitability models with citizen science data from iNaturalist.

## 🌐 Interactive Results
**View the interactive map:** [https://yourusername.github.io/hill-prairie-research/](https://yourusername.github.io/hill-prairie-research/)

## 📊 Key Features
- **Landscape Connectivity Analysis**: QGIS-based network analysis of prairie remnants
- **Machine Learning Models**: Habitat suitability prediction using environmental variables  
- **Citizen Science Integration**: iNaturalist species occurrence data validation
- **Interactive Visualization**: Web-based map for exploring results
- **Reproducible Workflow**: Documented methods and code

## 📁 Repository Structure
├── data/
│   ├── raw/gis_data/          # Original spatial datasets
│   └── processed/             # Analysis-ready data
├── scripts/
│   └── connectivity_analysis/ # QGIS connectivity analysis tools
├── web_app/                   # Interactive web map
├── notebooks/                 # Jupyter analysis notebooks
└── results/                   # Figures and reports

## 🛠️ Tools Used
- **QGIS**: Spatial analysis and connectivity modeling
- **Google Colab**: Machine learning model development  
- **iNaturalist**: Species occurrence validation
- **Python**: NetworkX, GeoPandas, Scikit-learn
- **Web**: Leaflet.js for interactive visualization

## 🚀 Getting Started

### For QGIS Users
1. Open QGIS and load your prairie polygon data
2. Run the connectivity analysis script:
   ```python
   exec(open('scripts/connectivity_analysis/prairie_connectivity_analysis.py').read())
   quick_prairie_analysis('your_layer_name', max_distance_km=2.0)
For Python Users

Clone this repository
Install dependencies: pip install -r requirements.txt
Explore the analysis notebooks

For Web Users
Visit the interactive map to explore prairie locations, connectivity patterns, and conservation priorities.
📖 Methodology
[Brief description of your connectivity analysis, ML models, and validation approach]
🔗 Related Links

iNaturalist Project: Driftless Remnant Hill Prairies
Research Publications
Contact Information

📄 Citation
If you use this work, please cite: [Your citation format]
📧 Contact
[Your contact information]

### 5. Update GitHub Pages Configuration

In your repository settings:
1. Go to **Settings** → **Pages**
2. Change source from **"/ (root)"** to **"/ web_app"**
3. Save changes

### 6. Test Your Integration

After restructuring, your web map should:
1. Load your actual training and validation features
2. Display them with different symbols/colors
3. Show real site attributes in popups
4. Allow users to toggle between datasets

## Next Steps After Restructuring

1. **Enhance the web map** with your real data attributes
2. **Run connectivity analysis** on your data using the QGIS script
3. **Export connectivity results** to web-friendly format
4. **Add model prediction layers** from your Google Colab work
5. **Create documentation** for your methodology
