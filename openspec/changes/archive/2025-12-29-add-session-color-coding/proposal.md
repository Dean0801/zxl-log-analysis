# Change: 为错误索引标签添加基于 sessionId 的颜色编码

## Why
当前错误索引标签（error-index-badge）使用固定的绿色样式，无法区分不同会话（session）的记录。通过根据 sessionId 动态分配颜色，可以帮助用户快速识别和分组属于同一会话的日志记录，提升日志分析的效率。

## What Changes
- 根据 `item.rawData.analysisData.sessionId` 为错误索引标签动态生成颜色
- 使用预定义的颜色列表循环分配颜色，确保同一 sessionId 始终使用相同颜色
- 颜色应用于标签的背景、边框和字体，提供清晰的视觉区分,字体颜色直接使用,边框和背景使用一定的透明度
- 当 sessionId 数量超过颜色列表长度时，循环使用颜色列表

## Impact
- Affected specs: log-analysis
- Affected code: miniprogram-analysis.js, index.html（可能需要添加内联样式支持）
- Breaking change: 无，这是视觉增强功能，不影响现有功能逻辑

