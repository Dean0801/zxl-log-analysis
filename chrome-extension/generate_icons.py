#!/usr/bin/env python3
"""
生成 Chrome 扩展图标
需要安装 Pillow: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw
    import os

    # 确保 icons 目录存在
    os.makedirs("icons", exist_ok=True)

    # 创建 128x128 的基础图像
    size = 128
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 背景圆角矩形（蓝色主题，匹配按钮颜色）
    draw.rounded_rectangle(
        [4, 4, size - 4, size - 4],
        radius=24,
        fill=(37, 99, 235, 255),
    )

    # 文档图标（白色）
    doc_x, doc_y = 30, 22
    doc_w, doc_h = 44, 56
    draw.rounded_rectangle(
        [doc_x, doc_y, doc_x + doc_w, doc_y + doc_h],
        radius=4,
        fill=(255, 255, 255, 240),
    )

    # 文档折角
    fold_size = 14
    draw.polygon(
        [
            (doc_x + doc_w - fold_size, doc_y),
            (doc_x + doc_w, doc_y + fold_size),
            (doc_x + doc_w - fold_size, doc_y + fold_size),
        ],
        fill=(30, 64, 175, 200),
    )

    # 数据线条（蓝色）
    line_color = (37, 99, 235, 200)
    draw.line([(38, 44), (66, 44)], fill=line_color, width=4)
    draw.line([(38, 54), (58, 54)], fill=line_color, width=4)
    draw.line([(38, 64), (66, 64)], fill=line_color, width=4)

    # 箭头（右下角，表示导出）
    arrow_color = (255, 255, 255, 230)
    # 箭头主体
    draw.line([(72, 78), (100, 100)], fill=arrow_color, width=5)
    # 箭头头部
    draw.polygon(
        [(100, 100), (88, 100), (100, 88)],
        fill=arrow_color,
    )

    # 保存 128px
    img.save("icons/icon128.png", "PNG")
    print("  icon128.png")

    # 生成 48px 和 16px
    for s in [48, 16]:
        resized = img.resize((s, s), Image.Resampling.LANCZOS)
        resized.save(f"icons/icon{s}.png", "PNG")
        print(f"  icon{s}.png")

    print("\n✅ 扩展图标生成完成！")

except ImportError:
    print("❌ 需要安装 Pillow: pip install Pillow")
except Exception as e:
    print(f"❌ 生成失败: {e}")
