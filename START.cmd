@echo off
cls

echo ChatGIST Pro - Starting All Services
echo =====================================
echo.

cd /d F:\work\claude_code\chatgist_pro

echo Starting R Analytics APIs...
start cmd /c E:\R-4.4.1\bin\Rscript.exe --vanilla run_plumber_fixed.R
start cmd /c E:\R-4.4.1\bin\Rscript.exe --vanilla run_transcriptome_plumber.R
start cmd /c E:\R-4.4.1\bin\Rscript.exe --vanilla run_singlecell_plumber.R
start cmd /c E:\R-4.4.1\bin\Rscript.exe --vanilla run_proteomics_plumber.R

echo Waiting for R services...
timeout /t 10 /nobreak >nul

echo Starting Node.js services...
start cmd /c "cd backend && npm run dev"
start cmd /c "cd frontend && npm run dev"

echo.
echo All services are starting up!
echo.
echo Application URL: http://localhost:5173
echo.
echo Please wait 30-60 seconds for full startup.
echo.
pause