# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

This is a comprehensive **GIST (Gastrointestinal Stromal Tumor)** research platform consisting of:
1. **dbGIST Shiny Application**: Main gene expression analysis tool in the root directory
2. **GIST_Phosphoproteomics**: Phosphorylation analysis platform in the subdirectory
3. **Full-stack Web Application**: React frontend + Node.js backend for enhanced UI and AI integration

## Key Commands

### Running the Full Application Stack
```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Run complete stack (recommended)
npm run dev:full           # Linux/Mac (uses WSL R)
npm run dev:full:windows   # Windows native
# Or use scripts directly:
./start_with_shiny.sh      # Linux/Mac
start_with_shiny.bat       # Windows

# Run without Shiny backend
npm run dev                # Frontend + Backend only
```

### Running Individual Components

#### Main dbGIST Shiny App
```bash
# From root directory
R -e "shiny::runApp(port=4964)"
# Or
cd GIST_shiny
./start_shiny.sh           # Linux/Mac
start_shiny.bat            # Windows
```

#### Phosphoproteomics App
```bash
cd GIST_Phosphoproteomics
# AI version (default)
Rscript start_app.R ai 4972
# Basic version
Rscript start_app.R basic 4971
# Both versions
./start_dual.ps1           # Windows PowerShell
start_dual.bat             # Windows batch
```

### Package Installation
```r
# Core packages
install.packages(c("shiny", "bs4Dash", "shinyjs", "shinyBS", "tidyverse", 
                   "data.table", "stringr", "ggplot2", "ggsci", "patchwork", "pROC",
                   "DT", "plotly", "survival", "survminer", "shinyWidgets", "ggpubr"))

# Bioconductor packages
BiocManager::install(c("clusterProfiler", "org.Hs.eg.db", "EnsDb.Hsapiens.v75"))

# AI functionality packages
install.packages(c("httr", "jsonlite", "base64enc"))
```

## Architecture & Structure

### Main Repository Structure
```
GIST_web/
├── frontend/              # React TypeScript frontend
│   ├── src/
│   │   ├── pages/        # Home, AIChat, GistDatabase
│   │   └── components/   # Navbar, FloatingChat, etc.
│   └── vite.config.ts
├── backend/              # Node.js Express backend
│   └── src/
│       ├── routes/       # chat.js, gene.js, proxy.js
│       └── services/     # geneFetcher.js
├── GIST_shiny/          # Main Shiny application
│   ├── global.R         # Data loading & analysis functions
│   ├── ui.R            # UI with 5 analysis modules
│   └── server.R        # Server logic & AI integration
└── GIST_Phosphoproteomics/  # Phosphorylation analysis
```

### dbGIST Shiny Components
1. **global.R**: Loads dependencies, data files, defines analysis functions
2. **ui.R**: bs4Dash layout with 5 modules (gene expression, correlation, drug resistance, etc.)
3. **server.R**: Reactive logic, plot generation, AI chat integration
4. **ai_chat_module.R**: AI analysis functionality for plots

### Phosphoproteomics Components
1. **Unified Architecture**: Single codebase with runtime AI toggle
2. **Modular Design**: Separate modules for each analysis type
3. **Dynamic Configuration**: Environment-based settings (.env file)

### Data Files
#### Main App (in `GIST_shiny/original/`)
- **dbGIST_matrix(2).Rdata**: Gene expression matrices with clinical data
- **dbGIST_ImmuneCell.RData**: Immune cell infiltration data
- **dbGIST_msigdb.RData**: MSigDB pathway database
- **dbGIST_wikipathways.RData**: WikiPathways database

#### Phosphoproteomics
- **Phosphoproteomics_list.RDS**: Phosphorylation site data
- **Proteomics_ID_Pathway_list.RDS**: Pathway mapping data

## Key Functions

### Main dbGIST Functions
- `Judge_GENESYMBOL()`: Validates gene symbols
- `dbGIST_boxplot_*()`: Clinical parameter boxplots (Risk, Mutation, Age, etc.)
- `dbGIST_cor_ID()`: Gene-gene correlation analysis
- `dbGIST_boxplot_Drug()`: Drug resistance with ROC curves
- `dbGIST_boxplot_PrePost()`: Pre/post treatment comparison

### Phosphoproteomics Functions
- `Phosphoproteome_query()`: Query phosphorylation sites
- `dbGIST_Phosphoproteome_boxplot_*()`: Various clinical analyses
- `Pho_KM_function()`: Kaplan-Meier survival analysis

## Clinical Data Categories
Both applications analyze data across:
- **Patient**: Age, Gender, Risk level
- **Tumor**: Location, Size, Stage, Grade, WHO classification
- **Molecular**: Mutation type, Chromosome location
- **Treatment**: Imatinib resistance, Pre/post treatment status
- **Outcome**: Overall survival, Disease-free survival

## Port Configuration
- Frontend: 5173
- Backend API: 8000 (proxies to 3000)
- Main Shiny: 4964
- Phosphoproteomics AI: 4972
- Phosphoproteomics Basic: 4971

## AI Integration
- **OpenRouter API**: Configure in .env file with OPENROUTER_API_KEY
- **Runtime Toggle**: Switch AI on/off without restart (Phosphoproteomics)
- **Multi-modal Analysis**: Supports plot analysis and text queries
- **Active Module Tracking**: Ensures AI analyzes the correct plot

## Development Notes
- Reactive programming for dynamic updates
- Consistent ggplot2 theming across all plots
- Statistical methods: t-tests, correlation, ROC, survival analysis
- No package management (renv) currently implemented
- AI features require valid API key configuration