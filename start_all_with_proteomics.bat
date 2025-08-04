@echo off
echo ========================================
echo   ChatGIST Pro - 完整服务栈启动
echo   包含四维分析: 磷酸化 + 转录组 + 单细胞 + 蛋白质组
echo ========================================
echo.

cd /d "F:\work\claude_code\chatgist_pro"

echo 🚀 启动所有服务...
echo.

echo [1/6] 启动磷酸化分析API (端口 8001)...
start "磷酸化分析API" cmd /k "E:\R-4.4.1\bin\Rscript.exe" --vanilla run_plumber_fixed.R

timeout /t 3 >nul

echo [2/6] 启动转录组分析API (端口 8002)...
start "转录组分析API" cmd /k "E:\R-4.4.1\bin\Rscript.exe" --vanilla run_transcriptome_plumber.R

timeout /t 3 >nul

echo [3/6] 启动单细胞分析API (端口 8003)...
start "单细胞分析API" cmd /k "E:\R-4.4.1\bin\Rscript.exe" --vanilla run_singlecell_plumber.R

timeout /t 3 >nul

echo [4/6] 启动蛋白质组学分析API (端口 8004)...
start "蛋白质组学分析API" cmd /k "E:\R-4.4.1\bin\Rscript.exe" --vanilla run_proteomics_plumber.R

timeout /t 5 >nul

echo [5/6] 启动后端服务器 (端口 8000)...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 >nul

echo [6/6] 启动前端开发服务器 (端口 5173)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ 所有服务启动完成！
echo.
echo 📡 服务地址:
echo   • 前端应用: http://localhost:5173
echo   • 后端API: http://localhost:8000
echo   • 磷酸化分析: http://localhost:8001
echo   • 转录组分析: http://localhost:8002  
echo   • 单细胞分析: http://localhost:8003
echo   • 蛋白质组分析: http://localhost:8004
echo.
echo 🔧 API文档:
echo   • 磷酸化: http://localhost:8001/__docs__/
echo   • 转录组: http://localhost:8002/__docs__/
echo   • 单细胞: http://localhost:8003/__docs__/
echo   • 蛋白质组: http://localhost:8004/__docs__/
echo.
echo ⚠️  等待所有服务完全启动后再使用应用
echo     通常需要30-60秒时间
echo.

pause