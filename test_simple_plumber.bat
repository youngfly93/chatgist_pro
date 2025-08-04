@echo off
echo === 测试简单的 Plumber API ===
echo.
echo 启动测试 API...
echo 文档地址: http://localhost:8003/__docs__/
echo.
E:\R-4.4.1\bin\Rscript.exe --vanilla -e "library(plumber); pr <- pr('simple_plumber_test.R'); pr$run(port = 8003, host = '0.0.0.0', docs = TRUE)"
pause