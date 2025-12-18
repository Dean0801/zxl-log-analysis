## 1. 分析数据结构和提取逻辑
- [x] 1.1 分析response数据结构，确认code和message字段的位置
- [x] 1.2 确定从failReason中解析response数据的逻辑
- [x] 1.3 设计code和message的提取和存储方案

## 2. 实现数据提取功能
- [x] 2.1 在miniprogram-parser.js中添加提取response中code和message的函数
- [x] 2.2 将提取的code和message信息添加到item对象中
- [x] 2.3 确保code和message信息在数据解析时正确传递

## 3. 实现标签显示功能
- [x] 3.1 在miniprogram-analysis.js的renderTable函数中检测code字段
- [x] 3.2 当code为400、401等错误码时，生成状态码标签HTML
- [x] 3.3 当存在message字段时，生成消息标签HTML
- [x] 3.4 将标签添加到事件描述列的descContent中

## 4. 添加标签样式
- [x] 4.1 设计错误状态码标签的CSS样式（红色/橙色主题）
- [x] 4.2 设计错误消息标签的CSS样式
- [x] 4.3 确保标签样式与现有分类标签风格协调
- [x] 4.4 添加标签到index.html的CSS中

## 5. 测试和验证
- [x] 5.1 验证code为400时标签正确显示
- [x] 5.2 验证code为401时标签正确显示
- [x] 5.3 验证message标签正确显示message内容
- [x] 5.4 验证标签不影响现有的事件描述显示
- [x] 5.5 验证非错误状态码时不显示标签

