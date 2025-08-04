@echo off
echo === 启动 ChatGIST Pro 所有服务（包括单细胞分析） ===

REM 设置环境变量
set PLUMBER_API_ENABLED=true
set PLUMBER_API_URL=http://localhost:8001
set TRANSCRIPTOME_PLUMBER_ENABLED=true
set TRANSCRIPTOME_PLUMBER_URL=http://localhost:8002
set SINGLECELL_PLUMBER_ENABLED=true
set SINGLECELL_PLUMBER_URL=http://localhost:8003

REM 启动磷酸化 Plumber API
echo.
echo 1. 启动磷酸化 Plumber API (端口 8001)...
start "Phospho Plumber API" cmd /c "E:\R-4.4.1\bin\Rscript.exe --vanilla run_plumber_fixed.R"

REM 等待磷酸化 API 启动
echo 等待磷酸化 Plumber API 启动...
ping -n 8 localhost >nul

REM 启动转录组 Plumber API
echo.
echo 2. 启动转录组 Plumber API (端口 8002)...
start "Transcriptome Plumber API" cmd /c "cd /d F:\work\claude_code\chatgist_pro && E:\R-4.4.1\bin\Rscript.exe --vanilla run_transcriptome_plumber.R"

REM 等待转录组 API 启动
echo 等待转录组 Plumber API 启动...
ping -n 8 localhost >nul

REM 启动单细胞 Plumber API
echo.
echo 3. 启动单细胞 Plumber API (端口 8003)...
start "Single-cell Plumber API" cmd /c "cd /d F:\work\claude_code\chatgist_pro && E:\R-4.4.1\bin\Rscript.exe --vanilla run_singlecell_plumber.R"

REM 等待单细胞 API 启动
echo 等待单细胞 Plumber API 启动...
ping -n 8 localhost >nul

REM 启动前端和后端
echo.
echo 4. 启动前端和后端服务...
echo    - 前端: http://localhost:5173
echo    - 后端: http://localhost:8000
echo.
start "ChatGIST Pro" cmd /c "npm run dev"

REM 等待服务启动
ping -n 5 localhost >nul

REM 打开浏览器
echo.
echo 5. 打开浏览器...
start http://localhost:5173

echo.
echo === 所有服务已启动 ===
echo.
echo 服务地址：
echo - 前端应用: http://localhost:5173
echo - 后端 API: http://localhost:8000
echo - 磷酸化 Plumber API: http://localhost:8001
echo - 磷酸化 API 文档: http://localhost:8001/__docs__/
echo - 转录组 Plumber API: http://localhost:8002
echo - 转录组 API 文档: http://localhost:8002/__docs__/
echo - 单细胞 Plumber API: http://localhost:8003
echo - 单细胞 API 文档: http://localhost:8003/__docs__/
echo.
echo 可用的分析功能：
echo - 磷酸化蛋白质组学分析
echo - 转录组学分析（基因表达、临床特征、相关性、药物耐药等）
echo - 单细胞RNA测序分析（基因表达、细胞类型、UMAP可视化等）
echo.
echo 按任意键关闭此窗口（服务将继续运行）...
pause >nul