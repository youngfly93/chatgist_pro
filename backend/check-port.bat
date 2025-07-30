@echo off
echo 检查端口 8000 占用情况...
echo.
netstat -ano | findstr :8000
echo.
echo 如果上面显示了进程ID，可以使用以下命令结束进程：
echo taskkill /PID [进程ID] /F
echo.
pause