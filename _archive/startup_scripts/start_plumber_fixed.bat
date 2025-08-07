@echo off
echo === 启动修复版 Plumber API ===

REM 设置环境变量
set PLUMBER_API_ENABLED=true
set PLUMBER_API_URL=http://localhost:8001

REM 启动 Plumber API
echo 启动 Plumber API 服务器...
start "Plumber API Fixed" /B cmd /c E:\R-4.4.1\bin\Rscript.exe -e "plumber::pr_run(plumber::pr('phospho_plumber_api_fixed.R'), port=8001, host='0.0.0.0')"

REM 等待服务启动
echo 等待 Plumber API 启动...
ping -n 6 localhost >nul

echo Plumber API 已启动在 http://localhost:8001
echo 可以访问 http://localhost:8001/__docs__/ 查看 API 文档
echo.
echo 按任意键退出...
pause >nul