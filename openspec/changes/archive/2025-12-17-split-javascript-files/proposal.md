# Change: 将JavaScript文件按数据源拆分

## Why
当前所有页面都加载同一个analysis.js文件，虽然通过条件逻辑区分不同数据源，但这种方式存在以下问题：
- 代码耦合度高，小程序和神策的逻辑混合在一起
- 单个文件过大，包含不需要的功能
- 难以维护和独立测试
- 可能存在意外的相互影响

将JavaScript文件按数据源拆分可以实现：
- 代码解耦，每个页面只加载需要的功能
- 提高代码可维护性
- 减少bundle大小
- 便于独立开发和测试

## What Changes
- 创建 `miniprogram-analysis.js` 专门处理小程序日志页面逻辑
- 创建 `sensors-analysis.js` 专门处理神策日志页面逻辑
- 修改 `index.html` 加载 `miniprogram-analysis.js`
- 修改 `sensors.html` 加载 `sensors-analysis.js`
- 移除原有的 `analysis.js` 文件

## Impact
- Affected specs: log-analysis
- Affected code: 新增 miniprogram-analysis.js, sensors-analysis.js, 修改 index.html, sensors.html, 删除 analysis.js
- Breaking change: JavaScript文件结构重组
