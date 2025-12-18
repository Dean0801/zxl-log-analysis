# Project Context

## Purpose
- 浏览器端日志分析工具，支持神策导出的 Excel 与小程序 Grafana 导出的 JSON 数据。
- 提供事件筛选（事件名/分类/level/搜索）、分页、属性查看、细节 tooltip、原始数据复制以及按数据源导出（神策 → Excel， 小程序 → JSON），辅助产品/运营/研发快速排查日志与支付/广告/阅读等链路问题。

## Tech Stack
- 纯静态页面：HTML + 内联 CSS。
- 原生 ES Module JavaScript，无打包构建。
- XLSX 0.18.5（通过 jsdelivr CDN 引入）用于解析 Excel。
- 浏览器内置能力：FileReader、Clipboard API、DOM 事件/选择器。

## Project Conventions

### Code Style
- 模块化 ES import/export，函数式组织；业务文案和注释使用中文。
- 代码风格偏向单引号、少量/无分号，使用防抖、空值检查保护 DOM 访问。
- 分类/事件文案使用集中映射（`CATEGORY_STYLES`/`CATEGORY_NAMES`、事件映射表）以便复用。

### Architecture Patterns
- 单页静态应用：`index.html` 包含样式与基础脚本引导，`<script type="module" src="./analysis.js">` 作为入口。
- `analysis.js` 负责 DOM 初始化、数据源切换、筛选/分页/渲染与导出；`sensors-parser.js` / `miniprogram-parser.js` 负责各自数据源的解析、事件描述和详情格式化；`common.js` 提供通用格式化与映射。
- 直接运行于浏览器，无框架、无后端；UI 与逻辑通过 DOM 操作耦合。

### Testing Strategy
- 目前无自动化测试或 CI 配置，主要依赖手动验证。
- 手动检查建议：本地启动静态服务器（如 `python3 -m http.server 8080`），分别上传示例 `.xlsx/.xls`（神策）与 `.json`（Grafana）文件，验证解析成功提示、事件/分类/level 筛选、搜索、分页、tooltip 详情、属性弹层、导出与复制按钮。
- 异常输入校验：上传非支持格式应触发友好告警，解析失败应展示错误状态。

### Git Workflow
- 仓库默认分支为 `main`，当前未发现已文档化的分支/发布/CI 规范。
- 如需协作，建议使用功能分支 + PR 评审，并采用动词前缀的简洁提交信息（如 add/fix/update + 摘要）；请按团队约定调整。

## Domain Context
- 领域聚焦小程序/书城/阅读/支付/广告/渠道等日志，可解析神策自动采集与自定义事件，以及小程序 API/事件发布日志。
- 分类体系：auto/custom/pay/channel/read/search/ad/api/system 等；小程序日志含 level（INFO/WARN/ERROR）与 code/reason。
- 常见场景：支付流程追踪、章节解锁、广告观看、搜索和书城行为分析。

## Important Constraints
- 必须通过 HTTP 访问页面，禁止直接 file:// 打开（页面内置提示），否则模块加载/权限可能失败。
- 完全在浏览器内存中处理，超大文件可能导致性能或内存压力；数据含用户/订单等敏感信息，建议本地离线使用，避免上传第三方服务。
- 数据格式要求：神策需 `.xlsx/.xls`，含 event/time/user/page 及属性列；小程序 JSON 需包含 `line` 字段（可解析为 JSON）与 `timestamp`，并遵循 Grafana 导出结构。

## External Dependencies
- `https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js`（全局 XLSX 对象，用于神策 Excel 解析）。
- 浏览器原生 API：FileReader、Clipboard、DOM。
- 无 npm 依赖或后台服务；数据源来自神策导出文件与 Grafana 导出日志。
