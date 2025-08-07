@echo off
chcp 65001 > nul
echo Starting GIST AI Project with Plumber API...

REM Check dependencies
if not exist "node_modules" (
    goto install
)
if not exist "backend\node_modules" (
    goto install
)
if not exist "frontend\node_modules" (
    goto install
)
goto start

:install
echo Installing dependencies...
call npm run install:all

:start
echo Starting services...

REM Start Plumber API
echo Starting Plumber API server (port 8001)...
start cmd /k "title Plumber API && cd /d %~dp0 && Rscript --vanilla start_plumber_api.R"

REM Wait for Plumber API to start
echo Waiting for Plumber API to initialize...
timeout /t 8 /nobreak > nul

REM Start frontend and backend with environment variables
echo Starting frontend and backend services with Plumber API enabled...
cd /d %~dp0
cmd /c "set PLUMBER_API_ENABLED=true && set PLUMBER_API_URL=http://localhost:8001 && npm run dev"