@echo off
echo ==========================================
echo     ChatGIST Pro - Quick Start Menu
echo ==========================================
echo.
echo Choose an option:
echo   1. Basic (Frontend + Backend only)
echo   2. With Phosphoproteomics Analysis
echo   3. With Transcriptomics Analysis  
echo   4. With Single-cell Analysis
echo   5. Full Stack (All 4 Analysis Types)
echo   6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    echo Starting basic services...
    call start.bat
) else if "%choice%"=="2" (
    echo Starting with phosphoproteomics...
    start cmd /k "cd backend && npm run dev"
    timeout /t 3 /nobreak >nul
    start cmd /k "cd frontend && npm run dev"
    timeout /t 2 /nobreak >nul
    start cmd /k "Rscript --vanilla run_plumber_fixed.R"
) else if "%choice%"=="3" (
    echo Starting with transcriptomics...
    call start_all_with_transcriptome.bat
) else if "%choice%"=="4" (
    echo Starting with single-cell analysis...
    call start_all_with_singlecell.bat
) else if "%choice%"=="5" (
    echo Starting full stack...
    call start_all_with_proteomics.bat
) else if "%choice%"=="6" (
    echo Exiting...
    exit
) else (
    echo Invalid choice. Please run again.
    pause
)