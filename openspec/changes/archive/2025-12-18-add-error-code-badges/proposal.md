# Change: 在事件描述列添加错误状态码和消息标签

## Why
当API请求返回错误状态码（如400、401等）时，用户需要快速识别错误信息。当前的事件描述列只显示基本的事件信息，没有突出显示错误状态码和错误消息，导致用户需要点击"查看详情"才能看到错误信息，影响排查效率。

## What Changes
- 在事件描述列中检测并显示错误状态码标签（当code为400、401等错误码时）
- 在事件描述列中显示错误消息标签（显示message字段的内容）
- 标签样式需要醒目，与现有的分类标签风格一致
- 只在小程序数据源中实现此功能
- 保持现有的事件描述显示逻辑不变，标签作为额外信息添加

## Impact
- **Affected specs**: log-analysis (Log Analysis Tool requirement)
- **Affected code**: 
  - `miniprogram-parser.js` (提取response中的code和message字段)
  - `miniprogram-analysis.js` (在renderTable函数中添加标签显示逻辑)
  - `index.html` (可能需要添加标签样式CSS)
- **Breaking changes**: None - 纯UI增强，不影响现有功能
- **User experience**: 显著提升错误信息的可见性，加快问题排查速度

