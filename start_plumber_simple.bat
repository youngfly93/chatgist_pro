@echo off
echo Starting Plumber API...
cd /d "%~dp0"
Rscript --vanilla start_plumber_api.R
pause