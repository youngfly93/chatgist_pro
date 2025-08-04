@echo off
echo === 启动 ChatGIST Pro 所有服务 ===

REM 设置环境变量
set PLUMBER_API_ENABLED=true
set PLUMBER_API_URL=http://localhost:8001

REM 启动 Plumber API
echo.
echo 1. 启动 Plumber API (端口 8001)...
start "Plumber API" cmd /c "E:\R-4.4.1\bin\Rscript.exe --vanilla run_plumber_fixed.R"

REM 等待 Plumber API 启动
echo 等待 Plumber API 启动...
ping -n 8 localhost >nul

REM 启动前端和后端
echo.
echo 2. 启动前端和后端服务...
echo    - 前端: http://localhost:5173
echo    - 后端: http://localhost:8000
echo.
start "ChatGIST Pro" cmd /c "npm run dev"

REM 等待服务启动
ping -n 5 localhost >nul

REM 打开浏览器
echo.
echo 3. 打开浏览器...
start http://localhost:5173

echo.
echo === 所有服务已启动 ===
echo.
echo 服务地址：
echo - 前端应用: http://localhost:5173
echo - 后端 API: http://localhost:8000
echo - Plumber API: http://localhost:8001
echo - API 文档: http://localhost:8001/__docs__/
echo.
echo 按任意键关闭此窗口（服务将继续运行）...
pause >nul