# Change: 优化小程序事件详情为树形结构显示

## Why
当前小程序事件详情弹窗中的信息显示为纯文本格式，用户难以快速识别和理解API请求的结构信息。特别是对于包含[method]、[response]、[error]三个部分的API日志数据，现有的显示方式无法有效突出这三个主要组成部分，影响了开发者和运营人员对API调用情况的快速分析。

## What Changes
- 将小程序事件详情弹窗中的显示方式从纯文本改为树形结构
- 将API日志数据分为三个独立部分：[method]、[response]、[error]
- 每个部分都支持折叠/展开的树形结构显示
- 默认折叠子节点，点击父节点时展开显示详细信息
- 保持现有的复制功能和数据源标识显示
- 优化视觉层次结构，提升信息可读性

## Impact
- **Affected specs**: log-analysis (Enhanced Mini Program Event Details requirement)
- **Affected code**: miniprogram-parser.js (getMiniprogramEventDetail function)
- **Breaking changes**: None - UI enhancement that improves existing functionality
- **User experience**: Significantly improved readability for API log analysis
