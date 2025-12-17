# Change: 将数据源选择拆分为独立页面

## Why
当前页面将小程序埋点和神策埋点功能集成在一个页面中，用户需要在页面内切换数据源。这种设计使得页面较为复杂，用户体验不够清晰。将不同数据源的功能拆分为独立页面可以提高用户体验，让每个页面专注于单一数据源的处理。

## What Changes
- 将当前 `index.html` 重构为专门的小程序埋点页面
- 创建新的 `sensors.html` 页面专门处理神策埋点功能
- 在小程序页面添加"神策埋点"按钮，点击跳转到新页面
- 移除原有页面内的数据源切换功能

## Impact
- Affected specs: log-analysis
- Affected code: index.html (重构为主小程序页面), 新增 sensors.html
- Breaking change: 页面结构变化，用户访问路径改变
