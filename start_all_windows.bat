@echo off
echo Starting GIST AI Complete Project...

REM Start Shiny in new window
echo Starting Shiny app on port 4964...
start "GIST Shiny" cmd /k "cd /d F:\work\claude_code\GIST_web\GIST_shiny && R -e \"shiny::runApp(port=4964, host='0.0.0.0')\""

REM Wait a bit for Shiny to start
timeout /t 3 /nobreak

REM Start web app in WSL
echo Starting web application...
wsl -d Ubuntu -- bash -c "cd /mnt/f/work/claude_code/GIST_web && npm run dev"