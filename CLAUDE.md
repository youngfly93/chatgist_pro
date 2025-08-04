# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

ChatGIST Pro is an AI-powered web application for GIST (Gastrointestinal Stromal Tumor) research that combines:
- **React Frontend**: Modern TypeScript UI with responsive design and AI chat integration
- **Node.js Backend**: Express API server with dual AI service support and tool calling architecture
- **Triple R Analytics**: Phosphoproteomics + Transcriptomics + Single-cell RNA-seq analysis via Plumber APIs and command-line scripts
- **AI Services**: Kimi AI (primary) + Volcano Engine ARK API (DeepSeek v3) with tool calling capabilities
- **Multi-Domain Analysis**: Comprehensive GIST research covering protein modifications, gene expression, and cellular heterogeneity
- **Shiny Integration**: Optional R Shiny applications for advanced analysis (`GIST_Phosphoproteomics/`, `GIST_Transcriptome/`)
- **Single-cell Analysis**: Three datasets (In-house, GSE254762, GSE162115) with UMAP visualization and cell type profiling

## Key Commands

### Quick Start
```bash
# Install all dependencies
npm run install:all

# Basic stack (frontend + backend only)
npm run dev

# Complete stack with Plumber APIs (recommended for full functionality)
start_all_with_singlecell.bat     # Windows - All services including single-cell (LATEST)
start_all_with_transcriptome.bat  # Windows - All services including transcriptome  
start_all_services.bat            # Windows - All services
start_with_shiny.bat              # Windows - With optional Shiny apps

# Alternative minimal start
start.bat                         # Windows basic
```

### Service Architecture
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:8000 (Express server)
- **Phospho Plumber API**: http://localhost:8001 (R analytics for phosphoproteomics)
- **Transcriptome Plumber API**: http://localhost:8002 (R analytics for transcriptomics)
- **Single-cell Plumber API**: http://localhost:8003 (R analytics for single-cell RNA-seq)
- **API Documentation**: Available at `__docs__/` endpoint for each Plumber API

### Development Commands

#### Frontend (React + TypeScript)
```bash
cd frontend
npm run dev        # Start development server (port 5173)
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

#### Backend (Node.js + Express)
```bash
cd backend
npm run dev        # Start with auto-reload (port 8000)
npm start          # Start production server
```

### Testing
```bash
# Test R script integration
Rscript --vanilla phospho_api_demo.R --function="query" --gene="KIT"
Rscript --vanilla transcriptome_plumber_api.R --function="query" --gene="KIT"
Rscript --vanilla singlecell_api_adapter.R --function="query" --gene="KIT"

# Test Plumber APIs
test_plumber.bat                    # Test phospho Plumber API
test_transcriptome_plumber.bat      # Test transcriptome Plumber API
test_singlecell_plumber.bat         # Test single-cell Plumber API
test_simple_plumber.bat             # Quick phospho API test

# Backend service tests
cd backend/test
node test-phospho-service.js        # Phospho service integration
node test-singlecell-service.js     # Single-cell service integration
node test-tool-calling.js           # Tool calling system
node test-tool-calling-v2.js        # Enhanced tool calling
node test-singlecell-tool-calling.js # Single-cell tool calling
node test-new-phospho-endpoints.js  # Latest phospho endpoints
node test-new-transcriptome-endpoints.js # Transcriptome endpoints

# AI service tests
node test-kimi-direct.js            # Direct Kimi API test
node test-env.js                    # Environment configuration test
```

### Linting and Type Checking
```bash
# Frontend linting
cd frontend
npm run lint

# Frontend type checking (implicit in build)
npm run build
```

## Architecture

### Project Structure
```
chatgist_pro/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── pages/           # Home, AIChat, GistDatabase
│   │   ├── components/      # Navbar, FloatingChat, etc.
│   │   ├── App.tsx          # Main application component
│   │   └── App.css          # Global styles
│   └── vite.config.ts       # Vite configuration
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   │   ├── chat.js      # Kimi AI chat endpoints
│   │   │   ├── gene.js      # Gene data endpoints
│   │   │   ├── phospho.js   # Phospho analysis endpoints
│   │   │   └── proxy.js     # Proxy for external APIs
│   │   ├── services/        # Business logic
│   │   │   ├── geneFetcher.js
│   │   │   └── phosphoService.js
│   │   └── index.js         # Server entry point
│   └── test/                # API test scripts
├── GIST_Phosphoproteomics/  # Optional Shiny app (clone separately)
│   ├── modules/             # Analysis modules
│   ├── *.RDS               # Data files
│   └── app.R               # Shiny entry point
├── phospho_api_demo.R       # R script for demo phospho analysis
└── phospho_api_adapter.R    # R script adapter for real data
```

### Technology Stack
- **Frontend**: React 19, TypeScript 5.8, Vite 6.3, React Router 7.6, Axios
- **Backend**: Node.js, Express 5, ES Modules, Tool Calling Architecture
- **AI Services**: 
  - Kimi AI (kimi-k2-0711-preview) - Primary with tool calling
  - Volcano Engine ARK API (DeepSeek v3) - Alternative AI service
- **R Analytics**: 
  - Plumber APIs (HTTP-based, ports 8001/8002/8003)
  - Command-line scripts (fallback execution)
  - Triple domains: Phosphoproteomics + Transcriptomics + Single-cell RNA-seq
- **Data Analysis**: R with ggplot2, jsonlite, base64enc, plumber, survival, corrplot, Seurat, patchwork

## API Endpoints

### Chat API (Tool Calling Architecture)
- `POST /api/chat-v2` - Advanced AI chat with tool calling (primary)
  - Body: `{ message: string, messages?: array, sessionId?: string }`
  - Features: Parallel tool execution, multi-iteration conversations
- `POST /api/chat` - Basic chat endpoint (legacy)
- `POST /api/chat-with-tools` - Chat with tool integration

### Gene API
- `GET /api/gene/:symbol` - Get gene information
- `GET /api/gene/search/:query` - Search genes

### Phosphoproteomics Analysis API
- `POST /api/phospho/query` - Query phosphorylation sites
- `POST /api/phospho/boxplot` - Generate boxplot analysis
- `POST /api/phospho/survival` - Perform survival analysis
- `POST /api/phospho/comprehensive` - Comprehensive multi-analysis
- `GET /api/phospho/health` - Check service health

### Transcriptomics Analysis API
- `POST /api/transcriptome/query` - Query gene expression data
- `POST /api/transcriptome/boxplot` - Expression boxplot analysis
- `POST /api/transcriptome/survival` - Survival analysis with expression data
- `POST /api/transcriptome/correlation` - Gene correlation analysis
- `POST /api/transcriptome/comprehensive` - Multi-dimensional transcriptome analysis
- `GET /api/transcriptome/health` - Check transcriptome service health

### Single-cell RNA-seq Analysis API
- `POST /api/singlecell/query` - Query gene expression and cell type information
- `POST /api/singlecell/violin` - Generate violin plots across cell types
- `POST /api/singlecell/umap` - UMAP visualization (celltype/expression modes)
- `POST /api/singlecell/umap-celltype` - UMAP colored by cell types
- `POST /api/singlecell/umap-expression` - UMAP colored by gene expression
- `POST /api/singlecell/comprehensive` - Complete single-cell analysis suite
- `POST /api/singlecell/batch` - Batch analysis for tool calling
- `GET /api/singlecell/health` - Check single-cell service health
- `GET /api/singlecell/datasets` - Available datasets information

### Proxy API
- `POST /api/proxy/chat` - Alternative chat endpoint

## Configuration

### Backend Environment (.env)
```env
# AI Service Selection
USE_KIMI=true                      # Primary: Kimi AI
USE_ARK=false                      # Alternative: Volcano Engine ARK API

# Kimi AI Configuration (Primary)
KIMI_API_KEY=your_kimi_api_key_here
KIMI_API_URL=https://api.moonshot.cn/v1/chat/completions
KIMI_MODEL=kimi-k2-0711-preview

# Volcano Engine ARK API Configuration (Alternative)
ARK_API_KEY=your_ark_api_key_here
ARK_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
ARK_MODEL=deepseek-v3

# Server Configuration
PORT=8000
NODE_ENV=development

# Plumber API Configuration (Recommended)
PLUMBER_API_ENABLED=true
PLUMBER_API_URL=http://localhost:8001
TRANSCRIPTOME_PLUMBER_ENABLED=true
TRANSCRIPTOME_PLUMBER_URL=http://localhost:8002
SINGLECELL_PLUMBER_ENABLED=true
SINGLECELL_PLUMBER_URL=http://localhost:8003

# R Script Configuration (Fallback)
R_SCRIPT_PATH=../phospho_api_demo.R
TRANSCRIPTOME_SCRIPT_PATH=../transcriptome_plumber_api.R
SINGLECELL_SCRIPT_PATH=../singlecell_api_adapter.R
```

### Frontend Configuration
- API Base URL: `http://localhost:8000/api`
- Development Server: `http://localhost:5173`
- Vite proxy configured to forward `/api` requests

## R Script Integration

The application automatically detects and uses the real GIST_Phosphoproteomics project if available:

### Real Project Integration (GIST_Phosphoproteomics)
When the `GIST_Phosphoproteomics` directory exists:
- Uses `phospho_api_adapter.R` to bridge with the real Shiny application
- Accesses actual phosphoproteomics data from `Phosphoproteomics_list.RDS`
- Provides full analysis capabilities with real GIST patient data

### Demo Mode
When GIST_Phosphoproteomics is not available:
- Falls back to `phospho_api_demo.R` with simulated data
- Useful for development and testing

### Supported Functions
- **query**: Query phosphorylation sites for a gene
- **boxplot_TvsN**: Tumor vs Normal tissue comparison
- **boxplot_Risk**: Risk stratification analysis
- **boxplot_Gender**: Gender-based differences
- **boxplot_Age**: Age group analysis
- **boxplot_Location**: Tumor location analysis
- **boxplot_WHO**: WHO classification analysis
- **boxplot_Mutation**: Mutation status analysis
- **survival**: Kaplan-Meier survival analysis

Example usage:
```r
# Query phospho sites
Rscript phospho_api_adapter.R --function="query" --gene="KIT"

# Tumor vs Normal with specific phospho site
Rscript phospho_api_adapter.R --function="boxplot_TvsN" --gene="KIT" --site="KIT/S959"

# Survival analysis
Rscript phospho_api_adapter.R --function="survival" --gene="ACSS2" --site="ACSS2/S30" --cutoff="Auto" --survtype="OS"
```

## Development Workflow

1. **Frontend Development**:
   - Components use functional React with hooks
   - TypeScript for type safety
   - CSS modules for component styling
   - React Router for navigation

2. **Backend Development**:
   - ES modules (`type: "module"` in package.json)
   - Express middleware for CORS, JSON parsing
   - Child process spawning for R script execution
   - Structured error handling and logging

3. **AI Integration**:
   - Streaming responses from Kimi AI
   - Session management for conversation context
   - Error handling for API failures

## Port Configuration
- **Frontend Dev Server**: 5173 (Vite)
- **Backend API**: 8000 (Express)
- **Phospho Plumber API**: 8001 (R analytics)
- **Transcriptome Plumber API**: 8002 (R analytics)
- **Single-cell Plumber API**: 8003 (R analytics)
- **Shiny Apps** (optional): 3838 (R Shiny server)

## Key Dependencies

### Frontend
- react: ^19.1.0
- react-router-dom: ^7.6.2
- axios: ^1.9.0
- react-markdown: ^10.1.0
- typescript: ~5.8.3
- vite: ^6.3.5

### Backend
- express: ^5.1.0
- axios: ^1.9.0
- cors: ^2.8.5
- dotenv: ^16.5.0

### R Packages
```r
# Core analysis packages
install.packages(c("jsonlite", "base64enc", "ggplot2", "plumber"))

# Advanced analysis packages
install.packages(c("survival", "corrplot", "reshape2", "dplyr"))

# Transcriptome-specific packages
install.packages(c("pheatmap", "RColorBrewer"))

# Single-cell specific packages
install.packages(c("Seurat", "patchwork", "ggsci", "stringr"))
```

## Common Tasks

### Adding a New API Endpoint
1. Create route handler in `backend/src/routes/`
2. Import and use in `backend/src/index.js`
3. Update frontend API calls in relevant components

### Modifying R Analysis
1. Edit functions in `phospho_api_demo.R`
2. Test locally with command-line arguments
3. Update backend route handlers if parameters change

### Updating AI Integration
1. **System Prompts**: Modify prompts in `backend/src/config/prompts.js`
2. **Tool Definitions**: Update tool schemas in `backend/src/tools/` directory
3. **Service Logic**: Edit handlers in `backend/src/services/toolService.js`
4. **AI Service Selection**: Configure in `.env` (USE_KIMI vs USE_ARK)

#### Current AI Capabilities (Tool Calling Architecture)
**Phosphoproteomics Analysis**:
- Real phosphorylation sites (e.g., KIT/S25, KIT/S742, KIT/T590)
- Tumor vs Normal differential analysis
- Clinical correlations (risk, gender, age, location, WHO, mutation)
- Survival analysis with Kaplan-Meier curves

**Transcriptomics Analysis**:
- Gene expression profiling across clinical groups
- Expression-based survival analysis
- Gene correlation networks
- Drug resistance gene analysis
- Multi-dimensional clinical feature analysis

**Single-cell RNA-seq Analysis**:
- Gene expression across cell types with violin plots
- UMAP visualization for dimensionality reduction
- Cell type identification and annotation
- Gene expression overlay on UMAP coordinates
- Multi-dataset analysis (In-house, GSE254762, GSE162115)

**Advanced Features**:
- Parallel tool execution (multiple analyses simultaneously)
- Multi-iteration conversations with context retention
- Automatic service failover (Plumber API → command-line scripts)
- Real-time visualization integration

#### Testing AI Integration
```bash
node test-tool-calling-v2.js    # Latest tool calling system
node test-singlecell-tool-calling.js # Single-cell tool calling integration
node test-kimi-direct.js        # Direct Kimi API test
node test-env.js               # Configuration validation
```

## Troubleshooting

### Common Issues

1. **R script not found**: Ensure R is installed and in PATH (typically `E:\R-4.4.1\bin\Rscript.exe`)
2. **AI API errors**: Check API keys for Kimi or ARK in backend/.env
3. **Port conflicts**: 
   - Frontend: 5173
   - Backend: 8000
   - Phospho Plumber: 8001
   - Transcriptome Plumber: 8002
   - Single-cell Plumber: 8003
4. **CORS issues**: Backend includes CORS middleware for localhost:5173
5. **Plumber API not starting**: 
   - Check R package installation: `install.packages(c("plumber", "Seurat"))`
   - Verify data files exist in GIST_Phosphoproteomics/, GIST_Transcriptome/, and ChatGIST_ssc/
   - Check R script syntax with: `check_syntax.bat`

### Service Execution Modes

**Plumber API Mode (Recommended)**:
```bash
# Full stack with all APIs (recommended)
start_all_with_singlecell.bat

# Full stack with phospho + transcriptome
start_all_with_transcriptome.bat

# Individual API services
start_plumber_fixed.bat          # Only phospho API
start_transcriptome_plumber.bat  # Only transcriptome API
start_singlecell_plumber.bat     # Only single-cell API
```

Benefits:
- HTTP-based R analysis (faster, more reliable)
- Data kept in memory (better performance)
- Automatic API documentation at `/__docs__/`
- Parallel request handling

**Command-Line Mode (Fallback)**:
Automatically used when Plumber APIs are unavailable

### Windows-Specific Notes

- Use `npm run dev:full:windows` for Windows native development
- R scripts may need path adjustments on Windows
- Use `start.bat` for quick Windows startup

## Important Files to Know

### Core Architecture
- `backend/src/routes/chat_v2.js`: Advanced AI chat with tool calling (primary endpoint)
- `backend/src/services/toolService.js`: Tool orchestration and execution logic
- `backend/src/services/phosphoService.js`: Phosphoproteomics R integration
- `backend/src/services/transcriptomeService.js`: Transcriptomics R integration
- `backend/src/services/singleCellService.js`: Single-cell RNA-seq R integration
- `backend/src/config/prompts.js`: AI system prompts and configurations

### Tool Definitions
- `backend/src/tools/phosphoTools.js`: Phosphoproteomics tool schemas and handlers
- `backend/src/tools/transcriptomeTools.js`: Transcriptomics tool schemas and handlers
- `backend/src/tools/singleCellTools.js`: Single-cell RNA-seq tool schemas and handlers

### Frontend Components
- `frontend/src/pages/AIChat.tsx`: Main AI chat interface with tool calling support
- `frontend/src/components/FloatingChat.tsx`: Floating chat widget
- `frontend/src/components/MiniChat.tsx`: Compact chat component

### R Analytics
- `phospho_api_adapter.R`: Bridge to GIST_Phosphoproteomics data
- `transcriptome_plumber_api.R`: Transcriptomics analysis API
- `singlecell_api_adapter.R`: Single-cell RNA-seq analysis script
- `singlecell_plumber_api.R`: Single-cell Plumber API
- `run_plumber_fixed.R`: Phospho Plumber API server
- `run_transcriptome_plumber.R`: Transcriptome Plumber API server  
- `run_singlecell_plumber.R`: Single-cell Plumber API server

## Data Flow (Tool Calling Architecture)

1. **User Input** → Frontend (AIChat.tsx)
2. **Frontend** → Backend API (`/api/chat-v2`)
3. **Backend** → AI Service (Kimi/ARK) with tool definitions
4. **AI Service** → Tool calling requests (parallel execution)
5. **Tool Orchestrator** (toolService.js) → Route to appropriate services:
   - **Phospho Analysis** → phosphoService.js → Plumber API (8001) or R script
   - **Transcriptome Analysis** → transcriptomeService.js → Plumber API (8002) or R script
   - **Single-cell Analysis** → singleCellService.js → Plumber API (8003) or R script
6. **R Analytics** → JSON + Base64 plots response
7. **Tool Results** → AI Service for synthesis
8. **AI Response** → Frontend with integrated analysis and visualizations

### Execution Patterns
- **Parallel Tool Execution**: Multiple analyses run simultaneously
- **Service Failover**: Plumber API → Command-line script fallback
- **Multi-iteration**: AI can make follow-up tool calls based on results