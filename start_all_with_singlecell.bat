@echo off
chcp 65001 >nul
echo === Starting ChatGIST Pro All Services (Including Single-cell Analysis) ===

REM Set environment variables
set PLUMBER_API_ENABLED=true
set PLUMBER_API_URL=http://localhost:8001
set TRANSCRIPTOME_PLUMBER_ENABLED=true
set TRANSCRIPTOME_PLUMBER_URL=http://localhost:8002
set SINGLECELL_PLUMBER_ENABLED=true
set SINGLECELL_PLUMBER_URL=http://localhost:8003

REM Start Phosphoproteomics Plumber API
echo.
echo 1. Starting Phosphoproteomics Plumber API (port 8001)...
start "Phospho Plumber API" cmd /c "E:\R-4.4.1\bin\Rscript.exe --vanilla run_plumber_fixed.R"

REM Wait for Phospho API to start
echo Waiting for Phosphoproteomics Plumber API to start...
ping -n 8 localhost >nul

REM Start Transcriptome Plumber API
echo.
echo 2. Starting Transcriptome Plumber API (port 8002)...
start "Transcriptome Plumber API" cmd /c "cd /d F:\work\claude_code\chatgist_pro && E:\R-4.4.1\bin\Rscript.exe --vanilla run_transcriptome_plumber.R"

REM Wait for Transcriptome API to start
echo Waiting for Transcriptome Plumber API to start...
ping -n 8 localhost >nul

REM Start Single-cell Plumber API
echo.
echo 3. Starting Single-cell Plumber API (port 8003)...
start "Single-cell Plumber API" cmd /c "cd /d F:\work\claude_code\chatgist_pro && E:\R-4.4.1\bin\Rscript.exe --vanilla run_singlecell_plumber.R"

REM Wait for Single-cell API to start
echo Waiting for Single-cell Plumber API to start...
ping -n 8 localhost >nul

REM Start frontend and backend
echo.
echo 4. Starting frontend and backend services...
echo    - Frontend: http://localhost:5173
echo    - Backend: http://localhost:8000
echo.
start "ChatGIST Pro" cmd /c "npm run dev"

REM Wait for services to start
ping -n 5 localhost >nul

REM Open browser
echo.
echo 5. Opening browser...
start http://localhost:5173

echo.
echo === All Services Started ===
echo.
echo Service URLs:
echo - Frontend App: http://localhost:5173
echo - Backend API: http://localhost:8000
echo - Phosphoproteomics Plumber API: http://localhost:8001
echo - Phosphoproteomics API Docs: http://localhost:8001/__docs__/
echo - Transcriptome Plumber API: http://localhost:8002
echo - Transcriptome API Docs: http://localhost:8002/__docs__/
echo - Single-cell Plumber API: http://localhost:8003
echo - Single-cell API Docs: http://localhost:8003/__docs__/
echo.
echo Available Analysis Features:
echo - Phosphoproteomics Analysis
echo - Transcriptomics Analysis (Gene Expression, Clinical Features, Correlation, Drug Resistance)
echo - Single-cell RNA-seq Analysis (Gene Expression, Cell Types, UMAP Visualization)
echo.
echo Press any key to close this window (services will continue running)...
pause >nul