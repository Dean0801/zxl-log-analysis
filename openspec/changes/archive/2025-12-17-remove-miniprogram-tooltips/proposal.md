# Change: 移除小程序日志事件描述列的hover tooltip

## Why
当前小程序日志页面的事件描述列具有复杂的hover tooltip功能，会在鼠标悬停时显示详细信息。虽然这个功能提供了额外的信息，但也可能造成用户体验的干扰：

- Hover tooltip会遮挡其他内容
- 在移动设备上hover行为不适用
- 与详情弹窗功能存在功能重叠
- 增加了界面复杂度

通过移除hover tooltip，可以：
- 简化界面交互，让用户专注于主要内容
- 避免tooltip遮挡问题
- 统一使用详情弹窗作为详细信息查看方式
- 改善移动端体验

## What Changes
- 移除小程序日志页面事件描述列的所有hover tooltip功能
- 简化事件描述列的HTML结构，移除复杂的wrapper和trigger元素
- 保留详情弹窗功能作为查看详细信息的主要方式
- 只影响小程序日志页面，神策页面保持不变

## Impact
- Affected specs: log-analysis
- Affected code: miniprogram-analysis.js
- Breaking change: 移除hover交互功能，但保留详情弹窗功能
