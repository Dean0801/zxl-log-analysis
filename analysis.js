/**
 * 埋点日志分析工具 - 主入口
 * 支持神策埋点(Excel)和小程序埋点(JSON)两种数据源
 */

import {
    CATEGORY_STYLES,
    CATEGORY_NAMES,
    formatFileSize,
    debounce,
    formatProperties,
    getPropertiesCount,
} from './common.js'

import {
    SENSORS_EVENT_MAP,
    parseSensorsData,
    getPayEventDetail,
    hasDetailTooltip as sensorsHasDetailTooltip,
    getTooltipIcon as sensorsGetTooltipIcon,
    exportToExcel,
} from './sensors-parser.js'

import {
    MINIPROGRAM_EVENT_MAP,
    EVENT_NAME_MAP,
    parseMiniprogramData,
    getMiniprogramEventDetail,
    exportToJSON,
} from './miniprogram-parser.js'

// 全局变量
let allData = []
let filteredData = []
let currentPage = 1
let pageSize = 50
let currentDataSource = 'miniprogram' // 默认小程序

// DOM 元素（延迟初始化）
let uploadArea, fileInput, fileInfo, resultSection, tableBody
let eventFilter, categoryFilter, levelFilter, searchInput, pagination, pageSizeSelect
let dataSourceSelect, uploadHint

// 复制工具
window.copyData = function (btn) {
    try {
        const txt = decodeURIComponent(btn?.dataset?.copy || '')
        navigator.clipboard?.writeText(txt)
    } catch (e) {
        console.error('复制失败', e)
    }
}

// 初始化函数
function init() {
    // 获取DOM元素
    uploadArea = document.getElementById('uploadArea')
    fileInput = document.getElementById('fileInput')
    fileInfo = document.getElementById('fileInfo')
    resultSection = document.getElementById('resultSection')
    tableBody = document.getElementById('tableBody')
    eventFilter = document.getElementById('eventFilter')
    categoryFilter = document.getElementById('categoryFilter')
    searchInput = document.getElementById('searchInput')
    levelFilter = document.getElementById('levelFilter')
    pagination = document.getElementById('pagination')
    pageSizeSelect = document.getElementById('pageSizeSelect')
    dataSourceSelect = document.getElementById('dataSourceSelect')
    uploadHint = document.getElementById('uploadHint')

    // 检查必要的DOM元素是否存在
    if (!uploadArea || !fileInput || !fileInfo) {
        console.error('必要的DOM元素未找到，请检查HTML结构')
        return
    }

    uploadArea.addEventListener('dragover', handleDragOver)
    uploadArea.addEventListener('dragleave', handleDragLeave)
    uploadArea.addEventListener('drop', handleDrop)
    fileInput.addEventListener('change', handleFileSelect)

    if (eventFilter) eventFilter.addEventListener('change', applyFilters)
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters)
    if (searchInput) searchInput.addEventListener('input', debounce(applyFilters, 300))
    if (pageSizeSelect) pageSizeSelect.addEventListener('change', handlePageSizeChange)
    if (dataSourceSelect) dataSourceSelect.addEventListener('change', handleDataSourceChange)
    if (levelFilter) levelFilter.addEventListener('change', applyFilters)

    // 初始化分类筛选器
    updateCategoryFilter()
    // 默认选中小程序数据源
    if (dataSourceSelect) {
        dataSourceSelect.value = 'miniprogram'
        handleDataSourceChange({ target: dataSourceSelect })
    }

    console.log('✅ 埋点分析工具初始化完成')
}

// 等待DOM加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    // DOM已经加载完成
    init()
}

// 数据源切换处理
function handleDataSourceChange(e) {
    currentDataSource = e.target.value

    // 更新文件输入类型和提示
    if (fileInput && uploadHint) {
        if (currentDataSource === 'sensors') {
            fileInput.accept = '.xlsx,.xls'
            uploadHint.textContent = '支持 .xlsx, .xls 格式'
        } else {
            fileInput.accept = '.json'
            uploadHint.textContent = '支持 .json 格式 (Grafana 导出)'
        }
    }

    // 更新分类筛选器选项
    updateCategoryFilter()

    // level 筛选器仅小程序显示
    if (levelFilter) {
        if (currentDataSource === 'miniprogram') {
            levelFilter.style.display = 'inline-block'
        } else {
            levelFilter.value = ''
            levelFilter.style.display = 'none'
        }
    }

    // 清空已有数据
    allData = []
    filteredData = []
    if (resultSection) resultSection.style.display = 'none'
    if (fileInfo) fileInfo.style.display = 'none'
}

// 更新分类筛选器
function updateCategoryFilter() {
    if (!categoryFilter) return
    categoryFilter.innerHTML = '<option value="">全部分类</option>'

    if (currentDataSource === 'sensors') {
        categoryFilter.innerHTML += `
            <option value="auto">自动采集</option>
            <option value="custom">自定义事件</option>
            <option value="pay">支付相关</option>
            <option value="channel">渠道相关</option>
            <option value="read">阅读相关</option>
            <option value="search">搜索相关</option>
        `
    } else {
        categoryFilter.innerHTML += `
            <option value="api">API请求</option>
            <option value="ad">广告相关</option>
            <option value="pay">支付相关</option>
            <option value="read">阅读相关</option>
            <option value="search">搜索相关</option>
            <option value="system">系统事件</option>
            <option value="channel">渠道相关</option>
            <option value="custom">自定义</option>
        `
    }
}

// 分页大小变更处理
function handlePageSizeChange(e) {
    pageSize = parseInt(e.target.value, 10)
    currentPage = 1
    renderTable()
    renderPagination()
}

// 拖拽处理
function handleDragOver(e) {
    e.preventDefault()
    if (uploadArea) uploadArea.classList.add('dragover')
}

function handleDragLeave(e) {
    e.preventDefault()
    if (uploadArea) uploadArea.classList.remove('dragover')
}

function handleDrop(e) {
    e.preventDefault()
    if (uploadArea) uploadArea.classList.remove('dragover')
    const files = e.dataTransfer.files
    if (files.length > 0) {
        processFile(files[0])
    }
}

// 文件选择处理
function handleFileSelect(e) {
    const files = e.target.files
    if (files.length > 0) {
        processFile(files[0])
    }
}

// 处理文件
function processFile(file) {
    if (currentDataSource === 'sensors') {
        processExcelFile(file)
    } else {
        processJSONFile(file)
    }
}

// 处理 Excel 文件 (神策)
function processExcelFile(file) {
    if (!fileInfo) {
        console.error('fileInfo元素未初始化')
        return
    }

    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']

    if (!validTypes.includes(file.type) && !file.name.match(/\.xlsx?$/i)) {
        alert('请上传 Excel 文件 (.xlsx 或 .xls)')
        return
    }

    fileInfo.style.display = 'block'
    fileInfo.style.background = '#e8f5e9'
    fileInfo.style.color = '#2e7d32'
    fileInfo.textContent = `正在解析文件: ${file.name} (${formatFileSize(file.size)})`

    const reader = new FileReader()
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(firstSheet)

            fileInfo.innerHTML = `✅ 文件解析成功: <strong>${file.name}</strong> | 共 <strong>${jsonData.length}</strong> 条记录`

            allData = parseSensorsData(jsonData)
            updateEventFilter()
            applyFilters()
            resultSection.style.display = 'block'
        } catch (error) {
            console.error('解析错误:', error)
            fileInfo.style.background = '#ffebee'
            fileInfo.style.color = '#c62828'
            fileInfo.textContent = `❌ 文件解析失败: ${error.message}`
        }
    }
    reader.readAsArrayBuffer(file)
}

// 处理 JSON 文件 (小程序埋点)
function processJSONFile(file) {
    if (!fileInfo) {
        console.error('fileInfo元素未初始化')
        return
    }

    if (!file.name.match(/\.json$/i)) {
        alert('请上传 JSON 文件 (.json)')
        return
    }

    fileInfo.style.display = 'block'
    fileInfo.style.background = '#e3f2fd'
    fileInfo.style.color = '#1565c0'
    fileInfo.textContent = `正在解析文件: ${file.name} (${formatFileSize(file.size)})`

    const reader = new FileReader()
    reader.onload = function (e) {
        try {
            const jsonData = JSON.parse(e.target.result)

            fileInfo.innerHTML = `✅ 文件解析成功: <strong>${file.name}</strong> | 共 <strong>${jsonData.length}</strong> 条记录`

            allData = parseMiniprogramData(jsonData)
            updateEventFilter()
            applyFilters()
            resultSection.style.display = 'block'
        } catch (error) {
            console.error('解析错误:', error)
            fileInfo.style.background = '#ffebee'
            fileInfo.style.color = '#c62828'
            fileInfo.textContent = `❌ 文件解析失败: ${error.message}`
        }
    }
    reader.readAsText(file)
}

// 更新事件筛选器
function updateEventFilter() {
    if (!eventFilter) return
    const eventTypes = [...new Set(allData.map((d) => d.event))].sort()
    eventFilter.innerHTML = '<option value="">全部事件</option>'

    eventTypes.forEach((event) => {
        let info
        if (currentDataSource === 'sensors') {
            info = SENSORS_EVENT_MAP[event] || { desc: '未知事件' }
        } else {
            info = MINIPROGRAM_EVENT_MAP[event] || EVENT_NAME_MAP[event] || { desc: event.split('/').pop() || '未知事件' }
        }
        const option = document.createElement('option')
        option.value = event
        const fullText = `${info.desc || event}`
        // 限制选项文本长度，避免下拉框过宽
        const maxLength = 40
        const displayText = fullText.length > maxLength
            ? fullText.substring(0, maxLength) + '...'
            : fullText
        option.textContent = displayText
        option.title = fullText // 鼠标悬停时显示完整文本
        eventFilter.appendChild(option)
    })
}

// 应用筛选
function applyFilters() {
    if (!eventFilter || !categoryFilter || !searchInput) return

    const eventValue = eventFilter.value
    const categoryValue = categoryFilter.value
    const searchValue = searchInput.value.toLowerCase()
    const levelValue = currentDataSource === 'miniprogram' && levelFilter ? levelFilter.value : ''

    filteredData = allData.filter((item) => {
        // 事件筛选
        if (eventValue && item.event !== eventValue) return false

        // 分类筛选
        if (categoryValue && item.category !== categoryValue) return false

        // level 筛选（仅小程序）
        if (levelValue) {
            const itemLevel = (item.properties && item.properties.level) || (item.rawData && item.rawData.level)
            if (itemLevel !== levelValue) return false
        }

        // 搜索筛选
        if (searchValue) {
            const searchStr = `${item.event} ${item.desc} ${item.userId} ${item.pagePath} ${JSON.stringify(item.properties)}`.toLowerCase()
            if (!searchStr.includes(searchValue)) return false
        }

        return true
    })

    currentPage = 1
    renderTable()
    renderPagination()
}

// 检查是否需要显示tooltip
function hasDetailTooltip(item) {
    if (currentDataSource === 'sensors') {
        return sensorsHasDetailTooltip(item)
    } else {
        return item.hasTooltip || item.category === 'ad' || item.category === 'pay' || item.level === 'ERROR'
    }
}

// 获取tooltip图标
function getTooltipIcon(item) {
    if (currentDataSource === 'sensors') {
        return sensorsGetTooltipIcon(item)
    } else {
        return item.icon || '📋'
    }
}

// 获取事件详情
function getEventDetail(item) {
    if (currentDataSource === 'sensors') {
        return getPayEventDetail(item)
    } else {
        return getMiniprogramEventDetail(item)
    }
}

// 渲染表格
function renderTable() {
    if (!tableBody) return

    const escapeHtml = (str = '') =>
        String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')

    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const pageData = filteredData.slice(start, end)

    tableBody.innerHTML = pageData
        .map((item) => {
            const showTooltip = hasDetailTooltip(item)
            const tooltipIcon = getTooltipIcon(item)
            const isPay = item.category === 'pay'
            const isAd = item.category === 'ad'
            const isError = currentDataSource === 'miniprogram' && item.level === 'ERROR'
            const rowClass = isPay ? 'pay-row' : (isAd ? 'ad-row' : (isError ? 'error-row' : ''))

            // code / reason 小徽标（仅小程序）
            let codeReasonBadges = ''
            if (currentDataSource === 'miniprogram') {
                const codeVal = item.properties?.code
                const reasonVal = item.properties?.reason
                if (codeVal !== undefined) {
                    codeReasonBadges += `<span class="mini-badge code-badge">Code ${escapeHtml(codeVal)}</span>`
                }
                if (reasonVal) {
                    const reasonText = escapeHtml(String(reasonVal))
                    const shortReason = reasonText.length > 60 ? reasonText.slice(0, 60) + '...' : reasonText
                    codeReasonBadges += `<span class="mini-badge reason-badge" title="${reasonText}">${shortReason}</span>`
                }
            }

            const descContent = showTooltip
                ? `<div class="pay-desc-wrapper" onmouseenter="showPayTooltip(event, this)" onmouseleave="hidePayTooltip()">
                       <div class="pay-desc-trigger ${isPay ? '' : isAd ? 'tooltip-trigger-ad' : isError ? 'tooltip-trigger-error' : 'tooltip-trigger-read'}">
                           <span class="pay-icon">${tooltipIcon}</span>
                           <span>${item.desc}</span>
                       </div>
                       <div class="pay-tooltip ${isPay ? '' : isAd ? 'tooltip-ad' : isError ? 'tooltip-error' : 'tooltip-read'}">
                           <div class="pay-tooltip-title">${item.desc}</div>
                           <div class="pay-tooltip-detail">${item.detail}</div>
                           <div class="pay-tooltip-info">${getEventDetail(item)}</div>
                       </div>
                   </div>`
                : `<div><span style="margin-right: 6px;">${item.icon || ''}</span>${item.desc}</div><div class="event-desc">${item.detail}</div>`

            const eventNameContent = isError && item.failReason
                ? `<div class="pay-desc-wrapper" onmouseenter="showPayTooltip(event, this)" onmouseleave="hidePayTooltip()">
                        <div class="pay-desc-trigger tooltip-trigger-error">
                            <span class="pay-icon">⚠️</span>
                            <span>${currentDataSource === 'miniprogram' ? (item.desc || item.event) : item.event}</span>
                            ${codeReasonBadges}
                        </div>
                        <div class="pay-tooltip tooltip-error">
                            <div class="pay-tooltip-title">ERROR</div>
                            <div class="pay-tooltip-detail">${item.desc || item.event}</div>
                            <div class="pay-tooltip-info"><pre style="white-space: pre-wrap; margin: 0;">${item.failReason}</pre></div>
                        </div>
                    </div>`
                : `<div class="event-name-line">
                        <span class="event-badge ${CATEGORY_STYLES[item.category] || 'event-custom'}">${currentDataSource === 'miniprogram' ? (item.desc || item.event) : item.event}</span>
                        ${codeReasonBadges}
                   </div>`

            const rawJson = escapeHtml(JSON.stringify(item.rawData || {}, null, 2))
            const rawCopy = encodeURIComponent(JSON.stringify(item.rawData || {}, null, 2))

            return `
        <tr class="${rowClass}">
            <td>${item.index}</td>
            <td class="time-cell">${item.time || '-'}</td>
            <td class="${isError ? 'event-error' : ''}">
                ${eventNameContent}
            </td>
            <td class="desc-cell">${descContent}</td>
            <td>
                <span class="event-badge ${CATEGORY_STYLES[item.category] || 'event-custom'}">
                    ${CATEGORY_NAMES[item.category] || '其他'}
                </span>
            </td>
            <td class="page-cell">${item.pagePath || '-'}</td>
            <td class="properties-cell" onmouseenter="showTooltip(event, this)" onmouseleave="hideTooltip()">
                <span class="properties-trigger">${getPropertiesCount(item.properties)}</span>
                <div class="properties-tooltip" id="propsTooltip">
                    <pre>${formatProperties(item.properties)}</pre>
                </div>
            </td>
            <td>
                <button class="copy-btn" data-copy="${rawCopy}" onclick="copyData(this)">复制</button>
            </td>
        </tr>
    `
        })
        .join('')
}

// 渲染分页
function renderPagination() {
    if (!pagination) return

    const totalPages = Math.ceil(filteredData.length / pageSize)

    if (totalPages <= 1) {
        pagination.innerHTML = `<span class="page-info">共 ${filteredData.length} 条记录</span>`
        return
    }

    pagination.innerHTML = `
        <button onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>首页</button>
        <button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>
        <span class="page-info">第 ${currentPage} / ${totalPages} 页 (共 ${filteredData.length} 条)</span>
        <button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>
        <button onclick="goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>末页</button>
    `
}

// 跳转到指定页
window.goToPage = function(page) {
    const totalPages = Math.ceil(filteredData.length / pageSize)
    if (page < 1 || page > totalPages) return
    currentPage = page
    renderTable()
    renderPagination()
    document.querySelector('.table-container').scrollTop = 0
}

// 导出筛选结果
window.exportFilteredData = function() {
    if (currentDataSource === 'sensors') {
        exportToExcel(filteredData)
    } else {
        exportToJSON(filteredData)
    }
}

// 显示tooltip
window.showTooltip = function(event, cell) {
    const tooltip = cell.querySelector('.properties-tooltip')
    if (!tooltip) return

    const rect = cell.getBoundingClientRect()
    tooltip.style.display = 'block'
    const tooltipRect = tooltip.getBoundingClientRect()
    const tooltipWidth = tooltipRect.width || 400
    const tooltipHeight = tooltipRect.height || 300

    let left = rect.left - tooltipWidth - 8
    let top = rect.top

    if (left < 10) {
        left = rect.right + 8
    }
    if (left + tooltipWidth > window.innerWidth - 10) {
        left = rect.left
        top = rect.bottom + 4
    }
    if (top + tooltipHeight > window.innerHeight - 10) {
        top = window.innerHeight - tooltipHeight - 10
    }
    if (top < 10) {
        top = 10
    }

    tooltip.style.left = left + 'px'
    tooltip.style.top = top + 'px'
}

// 隐藏tooltip
window.hideTooltip = function() {
    const tooltips = document.querySelectorAll('.properties-tooltip')
    tooltips.forEach((t) => (t.style.display = 'none'))
}

// 显示支付详情tooltip
window.showPayTooltip = function(event, wrapper) {
    const tooltip = wrapper.querySelector('.pay-tooltip')
    if (!tooltip) return

    const rect = wrapper.getBoundingClientRect()
    tooltip.style.display = 'block'
    const tooltipRect = tooltip.getBoundingClientRect()
    const tooltipWidth = tooltipRect.width || 320
    const tooltipHeight = tooltipRect.height || 200

    let left = rect.left
    let top = rect.bottom + 4

    if (top + tooltipHeight > window.innerHeight - 10) {
        top = rect.top - tooltipHeight - 4
    }
    if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10
    }
    if (left < 10) {
        left = 10
    }
    if (top < 10) {
        top = rect.bottom + 4
    }

    tooltip.style.left = left + 'px'
    tooltip.style.top = top + 'px'
}

// 隐藏支付详情tooltip
window.hidePayTooltip = function() {
    const tooltips = document.querySelectorAll('.pay-tooltip')
    tooltips.forEach((t) => (t.style.display = 'none'))
}
