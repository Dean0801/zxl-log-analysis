# Change: 为小程序日志页面添加排序功能

## Why
当前小程序日志页面中的数据列表没有排序功能，用户无法控制数据显示的顺序。在处理大量日志数据时，按时间倒序（最新数据在前）查看通常更有意义，可以快速看到最新的日志记录。

## What Changes
- 在小程序日志页面的筛选器区域添加排序选择器
- 支持正序和倒序排列，默认倒序
- 排序基于数据记录的索引号（通常对应时间顺序）
- 只在小程序页面添加此功能，神策页面保持原有逻辑

## Impact
- Affected specs: log-analysis
- Affected code: index.html, miniprogram-analysis.js
- Breaking change: 无，用户界面增加新功能但不影响现有功能
