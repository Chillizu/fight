#!/usr/bin/env python3
"""
精灵表处理工具
批量处理、背景移除、标准化
"""

import os
import sys
from PIL import Image


def remove_background(input_path, output_path=None):
    """移除白色背景"""
    if output_path is None:
        output_path = input_path.replace(".png", "_clean.png")

    img = Image.open(input_path)
    img = img.convert("RGBA")
    data = img.getdata()

    new_data = []
    threshold = 200

    for pixel in data:
        r, g, b, a = pixel
        # 白色或接近白色设为透明
        if r > threshold and g > threshold and b > threshold:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append((r, g, b, a))

    img.putdata(new_data)
    img.save(output_path)
    print(f"[√] 已处理: {output_path}")
    return output_path


def standardize_size(input_path, output_path=None, size=(768, 1024)):
    """标准化精灵表尺寸"""
    if output_path is None:
        output_path = input_path.replace(".png", f"_std{size[0]}x{size[1]}.png")

    img = Image.open(input_path)
    img = img.resize(size, Image.LANCZOS)
    img.save(output_path)
    print(f"[√] 已标准化: {output_path}")
    return output_path


def batch_process(directory):
    """批量处理目录中的精灵表"""
    if not os.path.isdir(directory):
        print(f"[ERROR] 目录不存在: {directory}")
        return

    files = [f for f in os.listdir(directory) if f.endswith(".png")]

    if not files:
        print("[ERROR] 没有PNG文件")
        return

    print(f"找到 {len(files)} 个文件")

    for f in files:
        path = os.path.join(directory, f)
        try:
            remove_background(path)
        except Exception as e:
            print(f"[ERROR] 处理失败 {f}: {e}")


def show_help():
    """显示帮助"""
    print("""
精灵表处理工具

用法:
    python sprite_processor.py <命令> [参数]

命令:
    remove <文件>     - 移除白色背景
    std <文件>      - 标准化尺寸 (768x1024)
    batch <目录>    - 批量处理目录下所有PNG
    help           - 显示帮助

示例:
    python sprite_processor.py remove sprite.png
    python sprite_processor.py batch ../assets/sprites/
""")


def main():
    args = sys.argv[1:]

    if not args or args[0] == "help":
        show_help()
        return

    cmd = args[0]

    if cmd == "remove":
        if len(args) < 2:
            print("[ERROR] 需要文件名")
            return
        remove_background(args[1])

    elif cmd == "std":
        if len(args) < 2:
            print("[ERROR] 需要文件名")
            return
        standardize_size(args[1])

    elif cmd == "batch":
        if len(args) < 2:
            print("[ERROR] 需要目录路径")
            return
        batch_process(args[1])

    else:
        print(f"[ERROR] 未知命令: {cmd}")
        show_help()


if __name__ == "__main__":
    main()
