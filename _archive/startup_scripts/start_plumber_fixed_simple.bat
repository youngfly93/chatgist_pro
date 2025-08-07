@echo off
echo === 启动修复版 Plumber API (简化版) ===

REM 设置环境变量
set PLUMBER_API_ENABLED=true
set PLUMBER_API_URL=http://localhost:8001

REM 直接启动 R 脚本
echo 启动 Plumber API 服务器...
E:\R-4.4.1\bin\Rscript.exe start_plumber_fixed.R

pause