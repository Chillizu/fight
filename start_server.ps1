# 本地服务器启动脚本
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
python -m http.server 8000
