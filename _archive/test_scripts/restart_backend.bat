@echo off
echo Stopping backend processes...
taskkill /f /im node.exe
timeout /t 3
echo Starting backend server...
cd /d "F:\work\claude_code\chatgist_pro\backend"
npm start