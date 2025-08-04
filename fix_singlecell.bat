@echo off
echo === 修复单细胞服务配置 ===

echo 1. 启动单细胞 Plumber API...
start "Single-cell API" cmd /c "E:\R-4.4.1\bin\Rscript.exe --vanilla run_singlecell_plumber.R"

echo 等待 API 启动...
ping -n 5 localhost >nul

echo 2. 测试 API 健康状态...
curl -X GET "http://localhost:8003/singlecell/health" -H "accept: application/json"

echo.
echo 3. 设置环境变量...
set SINGLECELL_PLUMBER_ENABLED=true
set SINGLECELL_PLUMBER_URL=http://localhost:8003

echo.
echo === 修复完成 ===
echo 现在你可以使用单细胞分析功能了！
echo.
echo 测试命令:
echo curl -X POST "http://localhost:8003/singlecell/query" -H "Content-Type: application/json" -d "{\"gene\":\"KIT\"}"
echo.
pause