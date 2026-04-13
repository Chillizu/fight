/**
 * Node.js 本地服务器启动脚本
 * 使用: node start_server.js
 *
 * 如果未安装Node.js，请先从 https://nodejs.org/zh-cn/ 下载安装
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 8000;
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};

const server = http.createServer((req, res) => {
  let filePath = "." + url.parse(req.url).pathname;

  // 默认首页
  if (filePath === "./") {
    filePath = "./index.html";
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || "application/octet-stream";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        res.writeHead(404, { "Content-type": "text/html" });
        res.end("<h1>404 - 文件未找到</h1><p>请求的文件不存在</p>", "utf-8");
      } else {
        res.writeHead(500);
        res.end("服务器错误: " + error.code + " ..\n");
      }
    } else {
      res.writeHead(200, { "Content-type": contentType });
      res.end(content, "utf-8");
    }
  });
});

server.listen(PORT, () => {
  console.log("\n");
  console.log("========================================");
  console.log("  校园大乱斗 - 本地服务器");
  console.log("========================================");
  console.log("");
  console.log(`✓ 服务器已启动`);
  console.log(`✓ 监听端口: ${PORT}`);
  console.log("");
  console.log("访问地址:");
  console.log(`  主页:   http://localhost:${PORT}`);
  console.log(`  游戏:   http://localhost:${PORT}/index.html`);
  console.log("");
  console.log("按 Ctrl+C 停止服务器");
  console.log("");
});

// 优雅关闭
process.on("SIGINT", () => {
  console.log("\n\n服务器已停止");
  process.exit(0);
});
