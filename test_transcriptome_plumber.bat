@echo off
echo === 测试转录组 Plumber API ===
echo.
echo 启动测试版本的 Transcriptome API...
echo 文档地址: http://localhost:8002/__docs__/
echo Swagger UI: http://localhost:8002/__swagger__/
echo.
E:\R-4.4.1\bin\Rscript.exe --vanilla test_transcriptome_api.R
pause