#!/usr/bin/env python3
"""
系统验证工具
检查Python环境、依赖和项目结构
"""

import sys
import os
import shutil


def check_python():
    """检查Python版本"""
    version = sys.version_info
    print(f"[√] Python {version.major}.{version.minor}.{version.micro}")
    if version.major < 3 or (version.major == 3 and version.minor < 6):
        print("[ERROR] 需要 Python 3.6+")
        return False
    return True


def check_pillow():
    """检查Pillow库"""
    try:
        from PIL import Image

        print(f"[√] Pillow 已安装")
        return True
    except ImportError:
        print("[ERROR] Pillow 未安装")
        print("     运行: pip install Pillow")
        return False


def check_node():
    """检查Node.js"""
    node = shutil.which("node")
    if node:
        print("[√] Node.js 已安装")
        return True
    else:
        print("[-] Node.js 未安装（可选）")
        return True


def check_directories():
    """检查目录结构"""
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    required_dirs = [
        "assets",
        "assets/backgrounds",
        "assets/sprites",
        "js",
        "css",
    ]

    all_ok = True
    for d in required_dirs:
        path = os.path.join(base, d)
        if os.path.isdir(path):
            print(f"[√] {d}/")
        else:
            os.makedirs(path, exist_ok=True)
            print(f"[+] 已创建 {d}/")

    return all_ok


def verify_sprites():
    """验证精灵表"""
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sprites_dir = os.path.join(base, "assets", "sprites")

    if not os.path.isdir(sprites_dir):
        print("[-] 没有精灵表")
        return True

    files = os.listdir(sprites_dir)
    png_files = [f for f in files if f.endswith(".png")]

    if png_files:
        print(f"[√] {len(png_files)} 个精灵表文件")
    else:
        print("[-] 没有精灵表文件")

    return True


def main():
    print("=" * 40)
    print("校园大乱斗 - 系统验证")
    print("=" * 40)
    print()

    all_ok = True
    all_ok &= check_python()
    all_ok &= check_pillow()
    all_ok &= check_node()
    print()
    all_ok &= check_directories()
    print()
    verify_sprites()

    print()
    print("=" * 40)
    if all_ok:
        print("系统检查完成！可以开始游戏。")
    else:
        print("请修复上述问题后重试。")
    print("=" * 40)

    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
