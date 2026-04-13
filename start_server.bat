@echo off
REM 启动本地开发服务器
REM 此脚本使用Python的内置http.server模块

echo.
echo ========================================
echo     校园大乱斗 - 本地服务器启动器
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Python安装
    echo 请先安装Python: https://www.python.org/downloads/
    echo 安装时请勾选 "Add Python to PATH"
    pause
    exit /b 1
)

REM 获取脚本所在目录
cd /d "%~dp0"

REM 清屏
cls

echo [✓] Python 已安装
echo [✓] 当前目录: %cd%
echo.
echo 正在启动本地服务器...
echo.
echo ========================================
echo 访问地址: http://localhost:8000
echo 游戏地址: http://localhost:8000/index.html
echo ========================================
echo.
echo 按 Ctrl+C 可以停止服务器
echo.

REM 启动服务器 (在8000端口上)
python -m http.server 8000

pause
