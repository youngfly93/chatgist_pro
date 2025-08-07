@echo off
cls
title ChatGIST Pro - Starting All Services

echo ----------------------------------------
echo    ChatGIST Pro - Complete Stack
echo    Phospho + Transcriptome + SingleCell + Proteomics
echo ----------------------------------------
echo.

cd /d F:\work\claude_code\chatgist_pro

echo Starting services...
echo.

echo 1. Phosphoproteomics API (8001)
start /min cmd /c "E:\R-4.4.1\bin\Rscript.exe --vanilla run_plumber_fixed.R"
timeout /t 3 /nobreak >nul

echo 2. Transcriptome API (8002)
start /min cmd /c "E:\R-4.4.1\bin\Rscript.exe --vanilla run_transcriptome_plumber.R"
timeout /t 3 /nobreak >nul

echo 3. Single-cell API (8003)
start /min cmd /c "E:\R-4.4.1\bin\Rscript.exe --vanilla run_singlecell_plumber.R"
timeout /t 3 /nobreak >nul

echo 4. Proteomics API (8004)
start /min cmd /c "E:\R-4.4.1\bin\Rscript.exe --vanilla run_proteomics_plumber.R"
timeout /t 5 /nobreak >nul

echo 5. Backend Server (8000)
start /min cmd /c "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo 6. Frontend Server (5173)
start /min cmd /c "cd frontend && npm run dev"

echo.
echo ----------------------------------------
echo All services started!
echo ----------------------------------------
echo.
echo URLs:
echo   Frontend: http://localhost:5173
echo   Backend: http://localhost:8000
echo   Phospho: http://localhost:8001
echo   Transcriptome: http://localhost:8002  
echo   SingleCell: http://localhost:8003
echo   Proteomics: http://localhost:8004
echo.
echo Wait 30-60 seconds for full startup.
echo.
pause