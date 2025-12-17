## 1. 分析当前tooltip结构
- [x] 1.1 识别所有涉及tooltip的HTML元素和CSS类
- [x] 1.2 确认哪些tooltip需要保留（如果有）

## 2. 移除tooltip HTML结构
- [x] 2.1 修改renderTable函数中的descContent生成逻辑
- [x] 2.2 移除pay-desc-wrapper、pay-desc-trigger、pay-tooltip等元素
- [x] 2.3 简化事件描述列的HTML结构

## 3. 移除tooltip相关函数
- [x] 3.1 移除showPayTooltip和hidePayTooltip函数调用
- [x] 3.2 清理不再使用的tooltip相关代码

## 4. 验证功能
- [x] 4.1 验证事件描述列正常显示
- [x] 4.2 验证hover tooltip已完全移除
- [x] 4.3 验证详情弹窗功能正常
- [x] 4.4 验证与其他功能兼容
