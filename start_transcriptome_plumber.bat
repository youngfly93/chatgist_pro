@echo off
echo === 启动转录组 Plumber API ===

REM 设置环境变量
set TRANSCRIPTOME_PLUMBER_ENABLED=true
set TRANSCRIPTOME_PLUMBER_URL=http://localhost:8002

REM 启动 Plumber API
echo 启动 Transcriptome Plumber API 服务器...
E:\R-4.4.1\bin\Rscript.exe --vanilla run_transcriptome_plumber.R

pause