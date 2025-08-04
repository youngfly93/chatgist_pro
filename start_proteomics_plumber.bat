@echo off
echo === 启动GIST蛋白质组学分析API ===
echo 端口: 8004
echo API文档: http://localhost:8004/__docs__/
echo.

cd /d "F:\work\claude_code\chatgist_pro"

"E:\R-4.4.1\bin\Rscript.exe" --vanilla run_proteomics_plumber.R

pause