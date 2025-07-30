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
- **Interactive Visualizations**: Dynamic charts and graphs for research data

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
- R (v4.0 or higher)
- npm or yarn

### Required R Packages
```r
install.packages(c("jsonlite", "base64enc", "ggplot2"))
```

### Setup Steps

1. **Clone the repository**:
```bash
git clone https://github.com/youngfly93/chatgist_pro.git
cd chatgist_pro
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys and configuration
```

4. **Start the application**:
```bash
# Start backend
cd backend
npm start

# Start frontend (in another terminal)
cd frontend
npm start
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
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   └── App.tsx         # Main application component
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   └── index.js        # Server entry point
│   └── test/               # Backend tests
├── phospho_api_demo.R      # R script for phospho analysis
├── docs/                   # Documentation files
└── README.md              # This file
```

## 🧪 API Endpoints

### Chat API
- `POST /api/chat` - Send message to AI chat

### Phospho Analysis API
- `POST /api/phospho/query` - Query phosphorylation sites
- `POST /api/phospho/boxplot` - Generate boxplot analysis
- `POST /api/phospho/survival` - Perform survival analysis
- `GET /api/phospho/health` - Check service health

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
