# Change: 修改小程序模块默认排序方式为正序并在上传文件时重置

## Why
当前小程序模块的默认排序方式为倒序（最新数据在前），但用户希望默认使用正序排列。同时，每次上传新文件时应该重置排序状态，确保新文件的数据按照默认排序方式显示，避免保留之前文件的排序设置。

## What Changes
- 将小程序模块的默认排序方式从倒序（desc）改为正序（asc）
- 在每次上传文件时重置排序选择器为默认值（正序）
- 更新相关规范以反映新的默认行为

## Impact
- Affected specs: log-analysis
- Affected code: miniprogram-analysis.js
- Breaking change: 无，这是默认行为的调整，用户仍可通过排序选择器手动切换排序方式

