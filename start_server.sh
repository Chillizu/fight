#!/bin/bash
# 本地服务器启动脚本

cd "$(dirname "$0")"
python3 -m http.server 8000 2>/dev/null || python -m http.server 8000

