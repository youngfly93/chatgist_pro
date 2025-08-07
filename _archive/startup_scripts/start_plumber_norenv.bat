@echo off
echo === 启动修复版 Plumber API (无 renv) ===

REM 设置环境变量
set PLUMBER_API_ENABLED=true
set PLUMBER_API_URL=http://localhost:8001
set RENV_CONFIG_ACTIVATED=FALSE

REM 切换到当前目录
cd /d F:\work\claude_code\chatgist_pro

REM 直接运行 R 脚本
echo 启动 Plumber API 服务器...
E:\R-4.4.1\bin\Rscript.exe --vanilla run_plumber_fixed.R

pause