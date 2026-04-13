# 🎮 校园大乱斗 - 服务器启动指南

游戏需要在本地服务器上运行，以正确加载所有资源（图片、脚本等）。

## ⚡ 快速开始

### 方法1: 使用启动脚本（最简便）

#### Windows

1. **双击** `start_server.bat` 文件
2. 命令行窗口会自动打开并启动服务器
3. 自动使用 **Python 3** 启动 HTTP 服务器在 8000 端口
4. 在浏览器访问：`http://localhost:8000`

#### macOS/Linux

```bash
# 赋予执行权限
chmod +x start_server.sh

# 运行脚本
./start_server.sh
```

### 方法2: 使用 Python（推荐）

Python 通常已预装在大多数系统上。

```bash
# 在游戏目录打开终端/命令行
cd 到游戏目录

# 启动 HTTP 服务器
python -m http.server 8000

# 如果是 Python 2（较旧系统）
python -m SimpleHTTPServer 8000
```

然后在浏览器访问：**<http://localhost:8000>**

### 方法3: 使用 Node.js

如果你已安装 Node.js：

```bash
# 在游戏目录打开终端/命令行
cd 到游戏目录

# 启动 Node 服务器
node start_server.js
```

然后在浏览器访问：**<http://localhost:8000>**

### 方法4: 使用其他 HTTP 服务器

如果你有其他偏好的 HTTP 服务器（如 Apache、Nginx 等），只需将游戏目录设置为服务器的根目录，然后访问游戏即可。

## 📝 可用的启动脚本

| 文件 | 说明 | 系统 |
|------|------|------|
| `start_server.bat` | 批处理脚本，使用 Python | Windows |
| `start_server.ps1` | PowerShell 脚本，使用 Python | Windows |
| `start_server.js` | Node.js 脚本 | 全平台 |
| `start_server.sh` | Bash 脚本，使用 Python | macOS/Linux |
| `tools/server_launcher.html` | 图形化启动器 | 全平台 |

## 🌐 访问游戏

启动服务器后，在浏览器访问以下地址：

- **游戏主页**: <http://localhost:8000>
- **游戏直接地址**: <http://localhost:8000/index.html>

## 🆘 常见问题

### Q: "端口 8000 已被占用"

**A**: 可以使用其他端口启动服务器：

```bash
# 使用 Python 启动在其他端口
python -m http.server 8080

# 然后访问: http://localhost:8080
```

### Q: "Python 未找到"

**A**: 需要安装 Python。请从 <https://www.python.org/downloads/> 下载安装。

- 安装时**务必勾选** "Add Python to PATH"
- 安装完成后重启命令行

### Q: "何时需要启动服务器？"

**A**: 以下功能需要服务器：

- 加载题库（questions.json）
- 加载图片资源
- AI 生成功能
- 任何外部资源

直接在浏览器打开 HTML 文件虽然可以显示，但会失去这些功能。

## 📚 进阶选项

### 使用 Python 的详细配置

如果需要自定义端口或绑定地址：

```bash
# 启动在特定 IP 和端口
python -m http.server 8000 --bind 127.0.0.1

# 启动在所有网卡（允许远程访问）
python -m http.server 8000 --bind 0.0.0.0
```

### 使用 Node.js 的详细配置

编辑 `start_server.js` 中的 `PORT` 变量 (默认为 8000):

```javascript
const PORT = 8000;  // 修改这个数字
```

## ✅ 检查服务器状态

访问 <http://localhost:8000> 如果看到游戏界面或文件列表，说明服务器正常运行。

## 🚀 停止服务器

在运行服务器的终端/命令行窗口中，按 **Ctrl + C** 即可停止服务器。

---

**祝你游戏愉快！** 🎮✨
