# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

ChatGIST Pro is an AI-powered web application for GIST (Gastrointestinal Stromal Tumor) research that combines:
- **React Frontend**: Modern TypeScript UI with responsive design
- **Node.js Backend**: Express API server with AI integration
- **R Script Integration**: Phosphoproteomics analysis via `phospho_api_demo.R`
- **Kimi AI**: Advanced conversational AI for research assistance

## Key Commands

### Quick Start
```bash
# Install all dependencies
npm run install:all

# Run complete stack (frontend + backend)
npm run dev

# Run with Shiny (if available)
npm run dev:full           # Linux/Mac
npm run dev:full:windows   # Windows native

# Alternative start scripts
./start.sh                 # Linux/Mac
start.bat                  # Windows
```

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

# Backend API tests
cd backend/test
node test-*.js
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
│   │   │   └── proxy.js     # Proxy for external APIs
│   │   ├── services/        # Business logic
│   │   │   └── geneFetcher.js
│   │   └── index.js         # Server entry point
│   └── test/                # API test scripts
└── phospho_api_demo.R       # R script for phospho analysis
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, React Router, Axios
- **Backend**: Node.js, Express 5, ES Modules
- **AI Integration**: Kimi AI API (kimi-k2-0711-preview model)
- **Data Analysis**: R with ggplot2, jsonlite, base64enc

## API Endpoints

### Chat API
- `POST /api/chat` - Send message to Kimi AI
  - Body: `{ message: string, sessionId?: string }`
  - Returns: `{ response: string, sessionId: string }`

### Gene API
- `GET /api/gene/:symbol` - Get gene information
- `GET /api/gene/search/:query` - Search genes

### Phospho Analysis API
- `POST /api/phospho/query` - Query phosphorylation sites
- `POST /api/phospho/boxplot` - Generate boxplot analysis
- `POST /api/phospho/survival` - Perform survival analysis
- `GET /api/phospho/health` - Check R script health

### Proxy API
- `POST /api/proxy/chat` - Alternative chat endpoint

## Configuration

### Backend Environment (.env)
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
- Frontend Dev Server: 5173
- Backend API: 8000
- Proxy Target: 3000 (if different backend)

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
install.packages(c("jsonlite", "base64enc", "ggplot2"))
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

### Updating AI Prompts
1. Modify system prompts in `backend/src/routes/chat.js`
2. Update analysis type mapping to match real project functions
3. Test with various input scenarios

#### Current AI Capabilities
The AI assistant now supports real GIST phosphoproteomics data analysis:
- **Query Analysis**: Real phosphorylation sites (e.g., KIT/S25, KIT/S742, KIT/T590)
- **Tumor vs Normal**: Differential phosphorylation analysis
- **Clinical Analysis**: Risk stratification, gender, age, location, WHO classification, mutation type
- **Survival Analysis**: Kaplan-Meier curves with real patient data

#### Testing AI Integration
```bash
node test-ai-chat.js
```