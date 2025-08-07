@echo off
cls
echo ========================================
echo   ChatGIST Pro - Complete Service Stack
echo   4D Analysis: Phospho + Transcriptome + SingleCell + Proteomics
echo ========================================
echo.

cd /d "F:\work\claude_code\chatgist_pro"

echo Starting all services...
echo.

echo [1/6] Starting Phosphoproteomics API (port 8001)...
start "Phospho API" cmd /k "E:\R-4.4.1\bin\Rscript.exe" --vanilla run_plumber_fixed.R

timeout /t 3 >nul 2>&1

echo [2/6] Starting Transcriptome API (port 8002)...
start "Transcriptome API" cmd /k "E:\R-4.4.1\bin\Rscript.exe" --vanilla run_transcriptome_plumber.R

timeout /t 3 >nul 2>&1

echo [3/6] Starting Single-cell API (port 8003)...
start "SingleCell API" cmd /k "E:\R-4.4.1\bin\Rscript.exe" --vanilla run_singlecell_plumber.R

timeout /t 3 >nul 2>&1

echo [4/6] Starting Proteomics API (port 8004)...
start "Proteomics API" cmd /k "E:\R-4.4.1\bin\Rscript.exe" --vanilla run_proteomics_plumber.R

timeout /t 5 >nul 2>&1

echo [5/6] Starting Backend Server (port 8000)...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 >nul 2>&1

echo [6/6] Starting Frontend Dev Server (port 5173)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo All services started successfully!
echo.
echo Service URLs:
echo   - Frontend App: http://localhost:5173
echo   - Backend API: http://localhost:8000
echo   - Phospho API: http://localhost:8001
echo   - Transcriptome API: http://localhost:8002  
echo   - SingleCell API: http://localhost:8003
echo   - Proteomics API: http://localhost:8004
echo.
echo API Documentation:
echo   - Phospho: http://localhost:8001/__docs__/
echo   - Transcriptome: http://localhost:8002/__docs__/
echo   - SingleCell: http://localhost:8003/__docs__/
echo   - Proteomics: http://localhost:8004/__docs__/
echo.
echo Please wait for all services to fully start.
echo This usually takes 30-60 seconds.
echo.

pause