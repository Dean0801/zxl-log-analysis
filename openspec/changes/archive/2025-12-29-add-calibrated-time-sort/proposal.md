# Change: 增加根据上报时间排序功能

## Why
用户需要能够根据上报时间（calibratedTime）对小程序日志数据进行排序，以便按时间顺序查看日志记录。当前系统仅支持根据记录索引（index）进行排序，无法满足按实际上报时间排序的需求。

## What Changes
- 增加一个新的排序选项：根据 `analysisData.calibratedTime` 字段进行排序
- 排序方式为顺序（正序），即时间早的记录在前，时间晚的记录在后
- 在排序选择器中增加"按上报时间排序"选项
- 当选择按上报时间排序时，使用 `item.rawData.analysisData.calibratedTime` 作为排序依据

## Impact
- Affected specs: `log-analysis` (Mini Program Data Sorting requirement)
- Affected code: 
  - `miniprogram-analysis.js` (排序逻辑和UI选择器)
  - `index.html` (排序选择器UI)

