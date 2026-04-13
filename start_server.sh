#!/bin/bash

# 校园大乱斗 - 本地服务器启动脚本
# 使用方法: chmod +x start_server.sh && ./start_server.sh

echo ""
echo "========================================"
echo "  校园大乱斗 - 本地服务器启动器"
echo "========================================"
echo ""

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "[错误] 未检测到 Python 安装"
        echo "请先安装 Python:"
        echo "  - Ubuntu/Debian: sudo apt-get install python3"
        echo "  - macOS: brew install python3"
        echo "  - 或访问: https://www.python.org/downloads/"
        exit 1
    fi
    PYTHON_CMD="python"
else
    PYTHON_CMD="python3"
fi

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "[✓] Python 已安装: $($PYTHON_CMD --version)"
echo "[✓] 当前目录: $(pwd)"
echo ""
echo "正在启动本地服务器..."
echo ""
echo "========================================"
echo "访问地址: http://localhost:8000"
echo "游戏地址: http://localhost:8000/index.html"
echo "========================================"
echo ""
echo "按 Ctrl+C 可以停止服务器"
echo ""

# 启动服务器
$PYTHON_CMD -m http.server 8000

