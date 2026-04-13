# PowerShell 脚本：启动本地开发服务器
# 使用: .\start_server.ps1

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "     校园大乱斗 - 本地服务器启动器"    -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Python是否安装
$pythonCheck = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "[错误] 未检测到Python安装" -ForegroundColor Red
  Write-Host "请先安装Python: https://www.python.org/downloads/" -ForegroundColor Yellow
  Write-Host "安装时请勾选 'Add Python to PATH'" -ForegroundColor Yellow
  Read-Host "按Enter键退出"
  exit 1
}

# 获取脚本所在目录
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "[✓] Python 已安装: $pythonCheck" -ForegroundColor Green
Write-Host "[✓] 当前目录: $(Get-Location)" -ForegroundColor Green
Write-Host ""
Write-Host "正在启动本地服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "访问地址: http://localhost:8000" -ForegroundColor Green
Write-Host "游戏地址: http://localhost:8000/index.html" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 可以停止服务器" -ForegroundColor Yellow
Write-Host ""

# 启动服务器
python -m http.server 8000

Read-Host "按Enter键退出"
