# Change: 添加文本导入功能

## Why
用户希望能够通过文本编辑框直接输入或粘贴 JSON 数据，而不需要先复制到剪贴板或保存为文件。这提供了更灵活的导入方式，特别适合需要手动编辑或从其他来源直接粘贴 JSON 数据的场景。

## What Changes
- 在页面上方（上传区域附近，与"导入剪贴板"按钮一起）添加"导入文本"按钮
- 点击按钮后弹出模态框，包含一个文本编辑框（textarea）
- 模态框包含"确定"和"取消"按钮
- 点击确定后，获取文本编辑框内容，使用与剪贴板导入相同的逻辑处理（支持单个 JSON 对象或数组）
- 点击取消或关闭按钮时关闭模态框

## Impact
- Affected specs: log-analysis (Import Additional Files requirement)
- Affected code: 
  - `index.html` - 添加文本导入按钮和模态框 UI
  - `miniprogram-analysis.js` - 添加文本导入处理逻辑（复用剪贴板导入的处理函数）
