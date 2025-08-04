@echo off
echo Testing Plumber API startup...
cd /d "%~dp0"
Rscript --vanilla start_plumber_norenv.R
pause