@echo off
chcp 65001 >nul 2>&1
title 校园大乱斗 - Campus Fighting Game

echo ========================================
echo   校园大乱斗 V0.7
echo   本地双人格斗 + 知识竞答
echo ========================================
echo.

REM Create directories
if not exist "assets\backgrounds" mkdir assets\backgrounds
if not exist "assets\sprites" mkdir assets\sprites

REM Check Python
where python >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Python found
    echo Starting server on port 8000...
    python -m http.server 8000
    goto :open_browser
)

REM Check Node.js
where node >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Node.js found
    echo Starting server on port 8080...
    npx http-server -p 8080 -c-1
    goto :open_browser
)

echo [ERROR] Neither Python nor Node.js found
echo Please install Python 3.6+ or Node.js 12+
echo.
echo Press any key to exit...
pause >nul
exit

:open_browser
start http://localhost:8000