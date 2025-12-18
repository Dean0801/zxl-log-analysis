#!/usr/bin/env python3
"""
生成 favicon.ico 文件
需要安装 Pillow: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw
    import os
    
    # 创建 64x64 的图像
    size = 64
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 背景圆形（绿色主题）
    draw.ellipse([2, 2, size-2, size-2], fill=(127, 190, 37, 255), outline=(90, 154, 16, 255), width=2)
    
    # 文档图标
    doc_x, doc_y = 18, 14
    doc_w, doc_h = 20, 26
    draw.rounded_rectangle([doc_x, doc_y, doc_x + doc_w, doc_y + doc_h], radius=2, fill=(255, 255, 255, 242))
    
    # 文档折角
    draw.polygon([(30, 14), (30, 20), (36, 20)], fill=(90, 154, 16, 204))
    
    # 数据线条
    draw.line([(22, 24), (34, 24)], fill=(127, 190, 37, 255), width=2)
    draw.line([(22, 28), (30, 28)], fill=(127, 190, 37, 255), width=2)
    draw.line([(22, 32), (36, 32)], fill=(127, 190, 37, 255), width=2)
    
    # 放大镜（分析图标）
    draw.ellipse([36, 36, 52, 52], outline=(255, 255, 255, 230), width=3)
    draw.line([(50, 50), (56, 56)], fill=(255, 255, 255, 230), width=3)
    
    # 保存为 PNG（用于现代浏览器）
    img.save('favicon.png', 'PNG')
    print('✓ favicon.png 已生成')
    
    # 创建多个尺寸的图标
    sizes = [16, 32, 48]
    icons = []
    for s in sizes:
        resized = img.resize((s, s), Image.Resampling.LANCZOS)
        icons.append(resized)
    
    # 保存为 ICO 文件
    img.save('favicon.ico', format='ICO', sizes=[(s, s) for s in sizes])
    print('✓ favicon.ico 已生成（包含 16x16, 32x32, 48x48 尺寸）')
    
    print('\n✅ Favicon 生成完成！')
    print('文件已创建：')
    print('  - favicon.svg (SVG 格式，现代浏览器)')
    print('  - favicon.png (PNG 格式)')
    print('  - favicon.ico (ICO 格式，传统浏览器)')
    
except ImportError:
    print('❌ 错误：需要安装 Pillow 库')
    print('请运行：pip install Pillow')
    print('\n或者使用在线工具：')
    print('1. 访问 https://favicon.io/')
    print('2. 上传 favicon.svg 文件')
    print('3. 下载生成的 favicon.ico')
except Exception as e:
    print(f'❌ 生成失败：{e}')
    print('\n备选方案：使用在线工具')
    print('1. 访问 https://favicon.io/ 或 https://realfavicongenerator.net/')
    print('2. 上传 favicon.svg 文件')
    print('3. 下载生成的 favicon.ico')

