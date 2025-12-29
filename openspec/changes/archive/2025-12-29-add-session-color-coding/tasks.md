## 1. 实现颜色分配逻辑
- [x] 1.1 创建函数根据 sessionId 分配颜色（使用哈希或索引取模）
- [x] 1.2 确保同一 sessionId 始终返回相同颜色
- [x] 1.3 实现颜色列表循环逻辑（超过列表长度时从头开始）

## 2. 修改错误索引标签渲染
- [x] 2.1 在 renderTable 函数中获取 sessionId
- [x] 2.2 根据 sessionId 计算对应的颜色
- [x] 2.3 为 error-index-badge 添加内联样式（background、border、color）
- [x] 2.4 处理 sessionId 不存在或为空的情况（使用默认样式）

## 3. 验证功能
- [x] 3.1 验证同一 sessionId 的记录使用相同颜色
- [x] 3.2 验证不同 sessionId 的记录使用不同颜色
- [x] 3.3 验证超过颜色列表长度时正确循环
- [x] 3.4 验证 sessionId 不存在时使用默认样式
- [x] 3.5 验证颜色对比度足够，文字清晰可读

