/**
 * 小程序日志分析工具 - 主入口
 * 专门处理小程序日志(JSON)数据源
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
let sortOrder = 'desc' // 默认倒序

// DOM 元素（延迟初始化）
let uploadArea, fileInput, fileInfo, resultSection, tableBody
let eventFilter, categoryFilter, levelFilter, searchInput, pagination, pageSizeSelect
let sortOrderSelect, uploadHint

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
    sortOrderSelect = document.getElementById('sortOrder')
    pagination = document.getElementById('pagination')
    pageSizeSelect = document.getElementById('pageSizeSelect')
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
    if (levelFilter) levelFilter.addEventListener('change', applyFilters)
    if (sortOrderSelect) sortOrderSelect.addEventListener('change', handleSortOrderChange)

    // 初始化分类筛选器
    updateCategoryFilter()

    // 设置文件输入类型（小程序专用）
    if (fileInput && uploadHint) {
        fileInput.accept = '.json'
        uploadHint.textContent = '支持 .json 格式 (Grafana 导出)'
    }

    // 显示level筛选器和排序选择器（小程序专用）
    if (levelFilter) {
        levelFilter.style.display = 'inline-block'
    }
    if (sortOrderSelect) {
        sortOrderSelect.style.display = 'inline-block'
        sortOrderSelect.value = sortOrder // 设置默认值
    }

    console.log('✅ 日志分析工具初始化完成')
}

// 等待DOM加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    // DOM已经加载完成
    init()
}

// 更新分类筛选器（小程序专用）
function updateCategoryFilter() {
    if (!categoryFilter) return
    categoryFilter.innerHTML = `
        <option value="">全部分类</option>
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

// 排序顺序变更处理
function handleSortOrderChange(e) {
    sortOrder = e.target.value
    // 确保在排序切换时重置到第1页并正确更新
    currentPage = 1
    applyFilters()
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

// 处理文件（小程序专用）
function processFile(file) {
    processJSONFile(file)
}

// 处理 JSON 文件 (小程序日志)
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
        const info = MINIPROGRAM_EVENT_MAP[event] || EVENT_NAME_MAP[event] || { desc: event.split('/').pop() || '未知事件' }
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
    const levelValue = levelFilter ? levelFilter.value : ''

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
            const searchStr = JSON.stringify(item).toLowerCase().replace(/[\n\r\s\\]+/g, '')
            if (!searchStr.includes(searchValue)) return false
        }

        return true
    })

    // 应用排序
    filteredData.sort((a, b) => {
        const aIndex = a.index || 0
        const bIndex = b.index || 0
        if (sortOrder === 'asc') {
            return aIndex - bIndex
        } else {
            return bIndex - aIndex
        }
    })

    // 确保重置到第1页（防止从非第1页切换排序时状态不一致）
    currentPage = 1
    
    // 确保表格和分页控件都正确更新
    renderTable()
    renderPagination()
    
    // 滚动到表格顶部，确保用户看到更新后的内容
    const tableContainer = document.querySelector('.table-container')
    if (tableContainer) {
        tableContainer.scrollTop = 0
    }
}

// 检查是否需要显示tooltip（小程序专用）
function hasDetailTooltip(item) {
    return item.hasTooltip || item.category === 'ad' || item.category === 'pay' || item.level === 'ERROR'
}

// 获取tooltip图标（小程序专用）
function getTooltipIcon(item) {
    return item.icon || '📋'
}

// 获取事件详情（小程序专用）
function getEventDetail(item) {
    return getMiniprogramEventDetail(item)
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
            const isPay = item.category === 'pay'
            const isAd = item.category === 'ad'
            const isError = item.level === 'ERROR'
            const rowClass = isPay ? 'pay-row' : (isAd ? 'ad-row' : (isError ? 'error-row' : ''))

            // code / reason 小徽标（仅小程序）
            let codeReasonBadges = ''
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

            // 生成错误状态码和消息标签
            let errorBadges = ''

            if (item.rawData?.analysisData?.index || item.rawData?.analysisData?.index === 0) {
                // 埋点顺序标签
                errorBadges += `<span class="error-index-badge">${item.rawData?.analysisData?.index}</span>`
            }
            
            if (item.responseCode && item.responseCode >= 400 && item.responseCode < 600) {
                // 状态码标签
                errorBadges += `<span class="error-code-badge">${item.responseCode}</span>`
                // 消息标签
                if (item.responseMessage) {
                    const messageText = escapeHtml(String(item.responseMessage))
                    const shortMessage = messageText.length > 30 ? messageText.slice(0, 30) + '...' : messageText
                    errorBadges += `<span class="error-message-badge" title="${messageText}">${shortMessage}</span>`
                }
            }
            
            // 如果有error信息，也显示标签
            if (item.errorMessage) {
                const errorText = escapeHtml(String(item.errorMessage))
                errorBadges += `<span class="error-message-badge" title="${errorText}">${errorText}</span>`
            }

            // 简化的事件描述显示，移除hover tooltip
            const descContent = `<div><span style="margin-right: 6px;">${item.icon || ''}</span>${item.desc}</div><div class="event-desc">${item.detail}</div>${errorBadges ? `<div style="margin-top: 4px; display: flex; gap: 6px; flex-wrap: wrap;">${errorBadges}</div>` : ''}`

            // 简化的事件名称显示，移除hover tooltip
            const eventNameContent = isError && item.failReason
                ? `<div class="event-name-line">
                        <span class="event-badge event-error">${item.desc || item.event}</span>
                        ${codeReasonBadges}
                   </div>`
                : `<div class="event-name-line">
                        <span class="event-badge ${CATEGORY_STYLES[item.category] || 'event-custom'}">${item.desc || item.event}</span>
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
            <td>
                <div class="operation-buttons">
                    <button class="detail-btn" onclick="showDetailModal(${item.index}, ${JSON.stringify(item).replace(/"/g, '&quot;')})">查看详情</button>
                    <button class="copy-btn" data-copy="${rawCopy}" onclick="copyData(this)">复制</button>
                </div>
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

// 导出筛选结果（小程序专用）
window.exportFilteredData = function() {
    exportToJSON(filteredData)
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

// 显示详情弹窗
// 树形结构交互函数
window.toggleTreeSection = function(sectionId) {
    const section = document.getElementById(sectionId)
    if (section) {
        section.classList.toggle('collapsed')
    }
}

window.toggleTreeNode = function(nodeId) {
    const node = document.getElementById(nodeId)
    if (node) {
        node.classList.toggle('collapsed')
    }
}

window.showDetailModal = function(index, itemData) {
    const modal = document.getElementById('detailModal')
    if (!modal) return

    // 填充弹窗内容
    const titleEl = document.getElementById('modalEventTitle')
    const descEl = document.getElementById('modalEventDesc')
    const detailEl = document.getElementById('modalEventDetail')
    const propertiesEl = document.getElementById('modalProperties')

    if (titleEl) titleEl.textContent = itemData.desc || itemData.event || '未知事件'
    if (descEl) descEl.textContent = itemData.detail || ''

    // 获取事件详情（复用现有逻辑）
    const eventDetail = getEventDetail(itemData)
    if (detailEl) detailEl.innerHTML = eventDetail

    // 格式化属性信息
    if (propertiesEl) {
        propertiesEl.textContent = JSON.stringify(itemData.rawData || {}, null, 2)
    }

    // 显示弹窗
    modal.style.display = 'block'

    // 添加关闭事件
    const closeBtn = modal.querySelector('.detail-modal-close')
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none'
        }
    }

    // 点击背景关闭
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none'
        }
    }

    // ESC键关闭
    const handleEsc = function(event) {
        if (event.key === 'Escape') {
            modal.style.display = 'none'
            document.removeEventListener('keydown', handleEsc)
        }
    }
    document.addEventListener('keydown', handleEsc)
}
