@echo off
echo 重启蛋白质组学 Plumber API...

REM 查找并终止现有的蛋白质组学API进程（端口8004）
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8004') do (
    echo 终止进程 PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)

REM 等待1秒
timeout /t 1 /nobreak >nul

echo 启动蛋白质组学 Plumber API...
cd /d "F:\work\claude_code\chatgist_pro"
start "" "E:\R-4.4.1\bin\Rscript.exe" proteomics_plumber_api.R

echo 蛋白质组学 API 重启完成！
echo 请等待几秒钟让服务完全启动...
timeout /t 5 /nobreak >nul