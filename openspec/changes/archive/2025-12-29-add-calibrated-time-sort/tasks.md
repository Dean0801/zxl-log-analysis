## 1. Implementation
- [x] 1.1 修改 `index.html` 中的排序选择器，增加"按上报时间排序"选项
- [x] 1.2 修改 `miniprogram-analysis.js` 中的排序逻辑，支持根据 `calibratedTime` 排序
- [x] 1.3 更新 `handleSortOrderChange` 函数以处理新的排序类型
- [x] 1.4 更新 `applyFilters` 函数中的排序逻辑，根据选择的排序类型使用不同的排序字段
- [x] 1.5 处理 `calibratedTime` 字段缺失或无效的情况（降级到 index 排序或使用默认值）

## 2. Validation
- [x] 2.1 验证选择"按上报时间排序"时，数据按 `calibratedTime` 正序排列
- [x] 2.2 验证当记录缺少 `calibratedTime` 字段时的降级处理
- [x] 2.3 验证排序切换时页面重置到第1页
- [x] 2.4 验证排序与筛选功能的兼容性

