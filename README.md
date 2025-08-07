# ChatGIST Pro

A comprehensive AI-powered web application for GIST (Gastrointestinal Stromal Tumor) research, featuring advanced chat capabilities, R script integration, and phosphoproteomics analysis tools.

## 🚀 Features

### AI Chat Integration
- **Kimi AI Integration**: Advanced conversational AI for research assistance
- **Real-time Chat**: Interactive chat interface with streaming responses
- **Context-aware Responses**: AI understands GIST research context

### R Script Integration
- **Phosphoproteomics Analysis**: Automated R script execution for protein analysis
- **Statistical Computing**: Advanced statistical analysis capabilities
- **Data Visualization**: Automatic generation of scientific plots and charts

### Analysis Tools
- **Phospho Site Query**: Search and analyze phosphorylation sites
- **Boxplot Analysis**: Compare tumor vs normal tissue phosphorylation levels
- **Survival Analysis**: Generate survival curves based on phosphorylation data
- **Comprehensive Analysis**: Multi-dimensional analysis combining 9 different analytical approaches
- **Interactive Visualizations**: Dynamic charts and graphs for research data
- **AI-Driven Insights**: Intelligent analysis recommendations and interpretations

### Modern Web Interface
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live data synchronization
- **Floating Chat**: Convenient chat interface overlay
- **Professional UI**: Clean, research-focused design

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Modern CSS3** with responsive design
- **Component-based Architecture**

### Backend
- **Node.js** with Express.js
- **RESTful APIs** for data access
- **R Script Integration** via child processes
- **JSON-based Communication**

### AI & Analytics
- **Kimi AI API** integration
- **R Statistical Computing**
- **Phosphoproteomics Analysis**
- **Base64 Image Encoding** for charts

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- R (v4.0 or higher, recommended v4.4.1)
- npm or yarn
- Windows OS (for .bat scripts) or Unix-like system

### Required R Packages
```r
# Core packages for basic functionality
install.packages(c("jsonlite", "base64enc", "ggplot2", "plumber"))

# Additional packages for full functionality
install.packages(c("survival", "corrplot", "reshape2", "dplyr", 
                   "pheatmap", "RColorBrewer", "Seurat", "patchwork", 
                   "ggsci", "stringr"))
```

## 📂 Required Data Files for Full Functionality

To enable all features of ChatGIST Pro, you need to place the following data files in their respective directories:

### 1. Phosphoproteomics Data (Port 8001)
**Directory**: `GIST_Phosphoproteomics/`

Required files:
- `Phosphoproteomics_list.RDS` - Main phosphoproteomics dataset
- `Proteomics_ID_Pathway_list.RDS` - Pathway analysis data
- `modules/` folder - Contains Shiny analysis modules (optional for Shiny app)

Clone from repository:
```bash
git clone https://github.com/youngfly93/GIST_Phosphoproteomics.git
```

### 2. Transcriptomics Data (Port 8002)
**Directory**: `GIST_Transcriptome/`

Required files:
- `list_survival.RDS` - Survival analysis data
- `list_matrix.RDS` - Gene expression matrix
- `DEG.RDS` - Differentially expressed genes
- `FPKM.RDS` - FPKM expression values
- `result_data.RDS` - Analysis results

Clone or download from your data source.

### 3. Single-cell RNA-seq Data (Port 8003)
**Directory**: `ChatGIST_ssc/`

Required files:
- `GIST_sct_In_house.rds` - In-house single-cell dataset
- `GIST_sct_GSE254762.rds` - Public dataset GSE254762
- `GIST_sct_GSE162115.rds` - Public dataset GSE162115
- `DEG_list.RDS` - Differential expression results

Clone or download from your data source.

### 4. Proteomics Data (Port 8004)
**Directory**: `GIST_Protemics/`

Required files:
- `Protemics_list.rds` - Main proteomics dataset
- `GSEA_KEGG.gmt` - KEGG pathway gene sets
- `GSEA_hallmark.gmt` - Hallmark gene sets
- `pathway_final.R` - Pathway analysis functions

Clone or download from your data source.

### Directory Structure After Setup
```
chatgist_pro/
├── frontend/                    # React frontend
├── backend/                     # Node.js backend
├── GIST_Phosphoproteomics/     # Phosphoproteomics data (clone from GitHub)
│   ├── Phosphoproteomics_list.RDS
│   ├── Proteomics_ID_Pathway_list.RDS
│   └── modules/
├── GIST_Transcriptome/          # Transcriptomics data (user provided)
│   ├── list_survival.RDS
│   ├── list_matrix.RDS
│   ├── DEG.RDS
│   ├── FPKM.RDS
│   └── result_data.RDS
├── ChatGIST_ssc/                # Single-cell data (user provided)
│   ├── GIST_sct_In_house.rds
│   ├── GIST_sct_GSE254762.rds
│   ├── GIST_sct_GSE162115.rds
│   └── DEG_list.RDS
├── GIST_Protemics/              # Proteomics data (user provided)
│   ├── Protemics_list.rds
│   ├── GSEA_KEGG.gmt
│   ├── GSEA_hallmark.gmt
│   └── pathway_final.R
└── [Other project files...]
```

### Verification
After placing all data files, you can verify the setup:

```bash
# Test each service individually
Rscript --vanilla phospho_api_adapter.R --function="query" --gene="KIT"
Rscript --vanilla transcriptome_plumber_api.R --function="query" --gene="KIT"
Rscript --vanilla singlecell_api_adapter.R --function="query" --gene="KIT"
Rscript --vanilla proteomics_api_adapter.R --function="query" --gene="KIT"

# Or start all services with
start_all_with_proteomics.bat  # Windows - All 4 analysis dimensions
```

### Quick Deployment (Complete Setup)

**完整部署流程 - 一步到位：**

1. **Clone main project**:
```bash
git clone https://github.com/youngfly93/chatgist_pro.git
cd chatgist_pro
```

2. **Clone GIST_Phosphoproteomics subproject** (contains all data and analysis modules):
```bash
git clone https://github.com/youngfly93/GIST_Phosphoproteomics.git
```

3. **Install all dependencies**:
```bash
# Install all dependencies for both frontend and backend
npm run install:all
```

4. **Configure environment**:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys:
# - KIMI_API_KEY=your_kimi_api_key_here
```

5. **Start the complete application**:
```bash
# Start both frontend and backend
npm run dev
```

**🎉 That's it! Your application is ready at:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Complete phosphoproteomics analysis with AI chat integration

---

### Manual Setup Steps (Alternative)

1. **Clone the repository**:
```bash
git clone https://github.com/youngfly93/chatgist_pro.git
cd chatgist_pro
```

2. **Install dependencies**:
```bash
# Install all dependencies for both frontend and backend
npm run install:all
```

3. **Configure data files**:
```bash
# Create the GIST_Phosphoproteomics directory
mkdir -p GIST_Phosphoproteomics
```

**Important**: You need to obtain and place the following data files in the `GIST_Phosphoproteomics/` directory:
- `Phosphoproteomics_list.RDS` - Contains phosphoproteomics data
- `Proteomics_ID_Pathway_list.RDS` - Contains pathway analysis data

These files are available in the separate GIST_Phosphoproteomics repository for complete functionality.

4. **Configure environment**:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys and configuration
```

5. **Start the application**:
```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
# Backend (port 8000)
cd backend && npm run dev

# Frontend (port 5173) - in another terminal
cd frontend && npm run dev
```

## 🔧 Configuration

### Environment Variables
Create `backend/.env` with the following:

```env
# Kimi AI Configuration
KIMI_API_KEY=your_kimi_api_key_here
KIMI_API_URL=https://api.moonshot.cn/v1/chat/completions
KIMI_MODEL=kimi-k2-0711-preview

# Server Configuration
PORT=8000
NODE_ENV=development

# R Script Configuration
R_SCRIPT_PATH=../phospho_api_demo.R
```

## 📁 Project Structure

```
chatgist_pro/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components (MiniChat, Navbar)
│   │   ├── pages/          # Page components (AIChat, GistDatabase)
│   │   └── App.tsx         # Main application component
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/         # API route handlers (chat, phospho, proxy)
│   │   ├── services/       # Business logic services
│   │   └── index.js        # Server entry point
│   └── test/               # Backend tests
├── GIST_Phosphoproteomics/  # R Shiny analysis modules (subproject)
│   ├── modules/            # Analysis modules (AI chat, survival, etc.)
│   ├── *.RDS               # Phosphoproteomics data files
│   ├── app.R               # Shiny application entry
│   └── start_*.R           # Deployment scripts
├── phospho_api_demo.R      # R script for API integration
├── phospho_api_adapter.R   # R script adapter for comprehensive analysis
└── README.md              # This file
```

### Key Components:

**Frontend (React + TypeScript)**
- Modern responsive web interface
- AI chat integration with comprehensive analysis display
- Real-time phosphoproteomics visualization

**Backend (Node.js + Express)**
- RESTful API for AI chat and data analysis
- R script integration for statistical computing
- Comprehensive analysis orchestration

**GIST_Phosphoproteomics (R Shiny)**
- Independent R Shiny application for detailed analysis
- Complete phosphoproteomics dataset and analysis modules
- Deployable as standalone research tool

## 🧪 API Endpoints

### Chat API
- `POST /api/chat` - Send message to AI chat

### Phospho Analysis API
- `POST /api/phospho/query` - Query phosphorylation sites
- `POST /api/phospho/boxplot` - Generate boxplot analysis
- `POST /api/phospho/survival` - Perform survival analysis
- `POST /api/phospho/comprehensive` - Comprehensive multi-analysis for single gene
- `GET /api/phospho/health` - Check service health

### Comprehensive Analysis Features

The comprehensive analysis system performs 9 different types of analyses for a single gene:

1. **Basic Query** - Phosphorylation site information
2. **Tumor vs Normal** - Statistical comparison (3 variants: basic, detailed, violin plots)
3. **Survival Analysis** - Kaplan-Meier curves (3 variants: basic, detailed, risk groups)  
4. **Boxplot Analysis** - Distribution comparison (2 variants: standard, grouped)

**AI Integration**: Simply ask "KIT基因全面分析" or "comprehensive analysis for KIT gene" in the chat interface to trigger automatic comprehensive analysis with all visualizations displayed inline.

## 🔬 R Script Integration

The application includes a comprehensive R script (`phospho_api_demo.R`) that provides:

- **Data Processing**: Statistical analysis of phosphoproteomics data
- **Visualization**: Automatic generation of scientific plots
- **Export Capabilities**: Base64-encoded image output
- **Error Handling**: Robust error management and logging

## 📚 Documentation

- [Kimi AI Integration Guide](KIMI_INTEGRATION.md)
- [Phospho Analysis Integration](PHOSPHO_INTEGRATION.md)
- [R Script Debugging Guide](R_LOG_GUIDE.md)
- [API Troubleshooting](KIMI_API_TROUBLESHOOTING.md)

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### R Script Testing
```bash
Rscript --vanilla phospho_api_demo.R --function="query" --gene="KIT"
```

### API Testing
Use the provided test scripts in `backend/test/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Kimi AI for conversational AI capabilities
- R Community for statistical computing tools
- React team for the excellent frontend framework
