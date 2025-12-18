# Change: 优化树形结构层级显示

## Why
当前树形结构显示中，子节点（如 `metadata` 是 `data` 的子节点）的层级关系不够清晰，看起来像是同级节点。这导致用户难以快速理解数据的嵌套结构，特别是在处理复杂的API响应数据时（如 `data.metadata` 这样的嵌套关系）。

## What Changes
- 增加基于深度的缩进机制，确保子节点的缩进明显大于父节点
- 添加视觉连接线来显示父子节点的层级关系
- 优化CSS样式，通过不同的背景色和边框来区分不同层级
- 改进树形节点的视觉层次，使嵌套结构一目了然
- 保持现有的折叠/展开功能和交互体验

## Impact
- **Affected specs**: log-analysis (Enhanced Mini Program Event Details requirement)
- **Affected code**: 
  - `index.html` (树形结构CSS样式)
  - `miniprogram-parser.js` (generateTreeNodes函数，添加深度信息)
- **Breaking changes**: None - 纯UI优化，不影响现有功能
- **User experience**: 显著提升数据结构的可读性和理解效率
