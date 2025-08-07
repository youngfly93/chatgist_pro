@echo off
echo Starting GIST AI complete project (including Shiny database)...

REM Check if dependencies are installed
if not exist "node_modules" goto install
if not exist "backend\node_modules" goto install
if not exist "frontend\node_modules" goto install
goto start

:install
echo Installing dependencies...
call npm run install:all

:start
echo Starting GIST Shiny database application (port 4964)...
cd GIST_shiny
start /B Rscript -e "shiny::runApp(port = 4964, host = '127.0.0.1', launch.browser = FALSE)"

REM Return to GIST_web directory
cd ..

echo Starting frontend and backend services...
call npm run dev