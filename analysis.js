/**
 * 神策埋点日志分析工具
 * 用于解析埋点数据并生成可视化报表
 */

// 事件描述映射表
const EVENT_MAP = {
    // ========== 神策自动采集事件 ==========
    $MPLaunch: {
        desc: '小程序启动',
        category: 'auto',
        detail: '用户打开小程序时触发',
    },
    $MPShow: {
        desc: '小程序显示',
        category: 'auto',
        detail: '小程序从后台切换到前台时触发',
    },
    $MPHide: {
        desc: '小程序隐藏',
        category: 'auto',
        detail: '小程序从前台切换到后台时触发',
    },
    $MPViewScreen: {
        desc: '页面浏览',
        category: 'auto',
        detail: '用户浏览页面时触发',
    },
    $MPShare: {
        desc: '分享事件',
        category: 'auto',
        detail: '用户点击分享时触发',
    },
    $MPClick: {
        desc: '元素点击',
        category: 'auto',
        detail: '用户点击页面元素时触发',
    },
    $MPAddFavorites: {
        desc: '添加收藏',
        category: 'auto',
        detail: '用户将小程序添加到收藏时触发',
    },
    $MPPageLeave: {
        desc: '页面离开',
        category: 'auto',
        detail: '用户离开当前页面时触发',
    },

    // ========== 书城相关事件 ==========
    BookPitSite_Click: {
        desc: '书城-书籍点击',
        category: 'custom',
        detail: '用户在书城页面点击某本书籍',
    },
    SearchColumn_Click: {
        desc: '书城-搜索栏点击',
        category: 'search',
        detail: '用户点击书城页面的搜索栏',
    },

    // ========== 搜索相关事件 ==========
    Search_ButtonClick: {
        desc: '搜索-搜索按钮点击',
        category: 'search',
        detail: '用户在搜索页点击搜索按钮',
    },
    SearchResult: {
        desc: '搜索-结果返回',
        category: 'search',
        detail: '搜索API返回结果时触发',
    },
    SearchPage_Click: {
        desc: '搜索-书籍点击',
        category: 'search',
        detail: '用户在搜索结果页点击某本书籍',
    },

    // ========== 阅读相关事件 ==========
    ReadDeatilPage_View: {
        desc: '阅读页-进入',
        category: 'read',
        detail: '用户进入阅读详情页',
    },
    ReadDeatilPage_Leave: {
        desc: '阅读页-离开',
        category: 'read',
        detail: '用户离开阅读详情页',
    },
    ReadDeatilPage_ButtonClick: {
        desc: '阅读页-按钮点击',
        category: 'read',
        detail: '用户在阅读页点击按钮',
        hasTooltip: true,
        tooltipIcon: '👆',
    },
    ReadDeatilPage_UnlockResult: {
        desc: '阅读页-章节解锁结果',
        category: 'read',
        detail: '章节解锁操作的结果',
        hasTooltip: true,
        tooltipIcon: '🔓',
    },
    ReadDeatilPage_LoadFail: {
        desc: '阅读页-加载失败',
        category: 'read',
        detail: '阅读页加载失败时触发',
    },

    // ========== 支付/会员相关事件 ==========
    BecomMemberPop_Exposure: {
        desc: '会员弹窗-曝光',
        category: 'pay',
        detail: '会员开通弹窗展示给用户',
        isPay: true,
    },
    BecomMember_SubmitOrder: {
        desc: '会员-提交订单',
        category: 'pay',
        detail: '用户提交会员订单',
        isPay: true,
    },
    Pay_Process: {
        desc: '支付流程日志',
        category: 'pay',
        detail: '支付流程中的各个节点日志',
        isPay: true,
    },
    RechargeCenter_View: {
        desc: '充值中心-访问',
        category: 'pay',
        detail: '用户进入充值中心页面',
        isPay: true,
    },
    RechargeCenter_Click: {
        desc: '充值中心-点击',
        category: 'pay',
        detail: '用户在充值中心点击商品',
        isPay: true,
    },
    Recharge_SubmitOrder: {
        desc: '充值-提交订单',
        category: 'pay',
        detail: '用户提交充值订单',
        isPay: true,
    },
    Recharge_PayResult: {
        desc: '充值-支付结果',
        category: 'pay',
        detail: '充值支付结果回调',
        isPay: true,
    },
    VIP_Purchase: {
        desc: 'VIP-购买',
        category: 'pay',
        detail: 'VIP购买事件',
        isPay: true,
    },
    UnlockChapter_Pay: {
        desc: '章节解锁-付费',
        category: 'pay',
        detail: '用户付费解锁章节',
        isPay: true,
    },

    // ========== 渠道/推广相关事件 ==========
    Channel_View: {
        desc: '渠道-访问',
        category: 'channel',
        detail: '通过推广渠道链接进入小程序',
    },
    Channel_login: {
        desc: '渠道-登录',
        category: 'channel',
        detail: '通过推广渠道进入后的登录事件',
    },
}

// 分类样式映射
const CATEGORY_STYLES = {
    auto: 'event-auto',
    custom: 'event-custom',
    pay: 'event-pay',
    channel: 'event-channel',
    read: 'event-read',
    search: 'event-search',
}

// 分类名称映射
const CATEGORY_NAMES = {
    auto: '自动采集',
    custom: '自定义',
    pay: '支付相关',
    channel: '渠道相关',
    read: '阅读相关',
    search: '搜索相关',
}

// 支付流程状态映射
const PAY_PROCESS_STATUS = {
    start: { text: '开始支付', icon: '🚀', color: '#2196f3' },
    request: { text: '发起请求', icon: '📤', color: '#ff9800' },
    success: { text: '支付成功', icon: '✅', color: '#4caf50' },
    fail: { text: '支付失败', icon: '❌', color: '#f44336' },
    cancel: { text: '取消支付', icon: '🚫', color: '#9e9e9e' },
    complete: { text: '流程完成', icon: '🏁', color: '#673ab7' },
    error: { text: '发生错误', icon: '⚠️', color: '#ff5722' },
}

// 全局变量
let allData = []
let filteredData = []
let currentPage = 1
let pageSize = 50

// DOM 元素
const uploadArea = document.getElementById('uploadArea')
const fileInput = document.getElementById('fileInput')
const fileInfo = document.getElementById('fileInfo')
const resultSection = document.getElementById('resultSection')
const tableBody = document.getElementById('tableBody')
const eventFilter = document.getElementById('eventFilter')
const categoryFilter = document.getElementById('categoryFilter')
const searchInput = document.getElementById('searchInput')
const pagination = document.getElementById('pagination')
const pageSizeSelect = document.getElementById('pageSizeSelect')

// 初始化事件监听
uploadArea.addEventListener('click', () => fileInput.click())
uploadArea.addEventListener('dragover', handleDragOver)
uploadArea.addEventListener('dragleave', handleDragLeave)
uploadArea.addEventListener('drop', handleDrop)
fileInput.addEventListener('change', handleFileSelect)
eventFilter.addEventListener('change', applyFilters)
categoryFilter.addEventListener('change', applyFilters)
searchInput.addEventListener('input', debounce(applyFilters, 300))
pageSizeSelect.addEventListener('change', handlePageSizeChange)

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
    uploadArea.classList.add('dragover')
}

function handleDragLeave(e) {
    e.preventDefault()
    uploadArea.classList.remove('dragover')
}

function handleDrop(e) {
    e.preventDefault()
    uploadArea.classList.remove('dragover')
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
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']

    if (!validTypes.includes(file.type) && !file.name.match(/\.xlsx?$/i)) {
        alert('请上传 Excel 文件 (.xlsx 或 .xls)')
        return
    }

    fileInfo.style.display = 'block'
    fileInfo.textContent = `正在解析文件: ${file.name} (${formatFileSize(file.size)})`

    const reader = new FileReader()
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(firstSheet)

            fileInfo.style.display = 'block'
            fileInfo.innerHTML = `✅ 文件解析成功: <strong>${file.name}</strong> | 共 <strong>${jsonData.length}</strong> 条记录`

            parseEventData(jsonData)
        } catch (error) {
            console.error('解析错误:', error)
            fileInfo.style.display = 'block'
            fileInfo.style.background = '#ffebee'
            fileInfo.style.color = '#c62828'
            fileInfo.textContent = `❌ 文件解析失败: ${error.message}`
        }
    }
    reader.readAsArrayBuffer(file)
}

// 解析事件数据
function parseEventData(jsonData) {
    allData = jsonData.map((row, index) => {
        const eventName = row.event || row.Event || row['event'] || row['$event'] || ''
        const eventInfo = EVENT_MAP[eventName] || {
            desc: '未知事件',
            category: eventName.startsWith('$') ? 'auto' : 'custom',
            detail: '暂无描述',
        }

        // 尝试解析时间字段
        let timeRaw = row.time || row.Time || row['$time'] || row['time'] || ''
        let timeStr = ''
        let timestamp = 0

        if (timeRaw) {
            if (typeof timeRaw === 'number') {
                // 如果是时间戳
                timestamp = timeRaw > 9999999999 ? timeRaw : timeRaw * 1000
                timeStr = formatTimeWithMs(new Date(timestamp))
            } else if (typeof timeRaw === 'string') {
                // 如果是字符串格式的时间
                const parsed = new Date(timeRaw)
                if (!isNaN(parsed.getTime())) {
                    timestamp = parsed.getTime()
                    timeStr = formatTimeWithMs(parsed)
                } else {
                    timeStr = timeRaw
                    timestamp = 0
                }
            }
        }

        // 获取用户ID
        const userId = row.distinct_id || row.user_id || row['$user_id'] || row.distinct_id || ''

        // 获取页面路径（优先使用 page_name）
        const pagePath = row.page_name || row['page_name'] || ''

        // 获取属性数据
        let properties = {}
        // 收集所有非基础字段作为属性，过滤掉值为 "NULL" 的属性
        const baseFields = ['event', 'Event', 'time', 'Time', '$time', 'distinct_id', 'user_id', '$user_id']
        Object.keys(row).forEach((key) => {
            if (!baseFields.includes(key)) {
                const value = row[key]
                // 过滤掉 NULL、"NULL"、null、undefined、空字符串
                if (value !== null && value !== undefined && value !== 'NULL' && value !== 'null' && value !== '') {
                    properties[key] = value
                }
            }
        })

        return {
            originalIndex: index + 1,
            time: timeStr,
            timestamp: timestamp,
            event: eventName,
            desc: eventInfo.desc,
            detail: eventInfo.detail,
            category: eventInfo.category,
            userId: userId,
            pagePath: pagePath,
            properties: properties,
            rawData: row,
        }
    })

    // 根据时间戳排序
    allData.sort((a, b) => a.timestamp - b.timestamp)

    // 重新设置排序后的序号
    allData.forEach((item, index) => {
        item.index = index + 1
    })

    // 更新事件筛选器
    updateEventFilter()

    // 应用筛选并显示结果
    applyFilters()

    // 显示结果区域
    resultSection.style.display = 'block'
}

// 更新统计信息
function updateStats() {
    const totalCount = allData.length
    const eventTypes = new Set(allData.map((d) => d.event))
    const autoEvents = allData.filter((d) => d.category === 'auto').length
    const customEvents = allData.filter((d) => d.category !== 'auto').length

    document.getElementById('totalCount').textContent = totalCount.toLocaleString()
    document.getElementById('eventTypeCount').textContent = eventTypes.size
    document.getElementById('autoEventCount').textContent = autoEvents.toLocaleString()
    document.getElementById('customEventCount').textContent = customEvents.toLocaleString()
}

// 支付流程类型映射
const PROCESS_TYPE_MAP = {
    create_order: { name: '创建订单', icon: '📝' },
    pay_poll_request_start: { name: '轮询请求开始', icon: '🔄' },
    pay_poll_request_result: { name: '轮询请求结果', icon: '📥' },
    request_pay: { name: '请求支付', icon: '📤' },
    pay_callback: { name: '支付回调', icon: '📥' },
    pay_success: { name: '支付成功', icon: '✅' },
    pay_fail: { name: '支付取消或失败', icon: '❌' },
    pay_complete: { name: '支付行为结束或轮询到结束态', icon: '🏁' },
    pay_cancel: { name: '取消支付', icon: '🚫' },
    verify_order: { name: '验证订单', icon: '🔍' },
}

// 获取支付事件详细描述
function getPayEventDetail(item) {
    const props = item.properties || {}
    const eventName = item.event
    let details = []

    // ReadDeatilPage_ButtonClick - 阅读页按钮点击
    if (eventName === 'ReadDeatilPage_ButtonClick') {
        // button_name 字段
        const buttonName = props.button_name || props.buttonName || props.btn_name || ''
        if (buttonName) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">👆</span>
                <span class="pay-detail-label">按钮名称:</span>
                <span class="pay-detail-value" style="font-weight: bold; color: #81c784">${buttonName}</span>
            </div>`)
        }

        // 页面信息
        const pageName = props.page_name || ''
        if (pageName) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">📄</span>
                <span class="pay-detail-label">所在页面:</span>
                <span class="pay-detail-value">${pageName}</span>
            </div>`)
        }

        return details.length > 0 ? details.join('') : '<div class="no-detail">暂无详细信息</div>'
    }

    // ReadDeatilPage_UnlockResult - 章节解锁结果
    if (eventName === 'ReadDeatilPage_UnlockResult') {
        // is_unlock 字段处理
        const isUnlock = props.is_unlock
        if (isUnlock !== undefined && isUnlock !== null) {
            const unlocked = isUnlock === true || isUnlock === 'true' || isUnlock === 1 || isUnlock === '1'
            details.push(`<div class="pay-detail-item" style="color: ${unlocked ? '#4caf50' : '#f44336'}">
                <span class="pay-detail-icon">${unlocked ? '✅' : '❌'}</span>
                <span class="pay-detail-label">解锁状态:</span>
                <span class="pay-detail-value" style="font-weight: bold">${unlocked ? '已解锁' : '未解锁'}</span>
            </div>`)
        }

        // 书籍信息
        const bookName = props.book_name || props.novel_name
        if (bookName) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">📚</span>
                <span class="pay-detail-label">书籍:</span>
                <span class="pay-detail-value">${bookName}</span>
            </div>`)
        }

        // 章节信息
        const chapterName = props.chapter_name || props.chapter_title
        if (chapterName) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">📖</span>
                <span class="pay-detail-label">章节:</span>
                <span class="pay-detail-value">${chapterName}</span>
            </div>`)
        }

        // 章节ID
        const chapterId = props.chapter_id
        if (chapterId) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">🔢</span>
                <span class="pay-detail-label">章节ID:</span>
                <span class="pay-detail-value">${chapterId}</span>
            </div>`)
        }

        // 解锁方式
        const unlockType = props.unlock_type || props.unlock_method
        if (unlockType) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">🔑</span>
                <span class="pay-detail-label">解锁方式:</span>
                <span class="pay-detail-value">${unlockType}</span>
            </div>`)
        }

        return details.length > 0 ? details.join('') : '<div class="no-detail">暂无详细信息</div>'
    }

    // BecomMember_SubmitOrder - 会员订单提交
    if (eventName === 'BecomMember_SubmitOrder') {
        const vipCardType = props.vip_card_type || props.card_type || ''

        if (vipCardType) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">🏷️</span>
                <span class="pay-detail-label">购买类型:</span>
                <span class="pay-detail-value">${vipCardType}</span>
            </div>`)
        }

        // 金额
        const amount = props.order_amount
        if (amount) {
            details.push(`<div class="pay-detail-item pay-amount">
                <span class="pay-detail-icon">💰</span>
                <span class="pay-detail-label">金额:</span>
                <span class="pay-detail-value">¥${amount}</span>
            </div>`)
        }

        // 订单号
        const orderId = props.order_id || props.order_no
        if (orderId) {
            details.push(`<div class="pay-detail-item pay-order">
                <span class="pay-detail-icon">🔖</span>
                <span class="pay-detail-label">订单号:</span>
                <span class="pay-detail-value">${orderId}</span>
            </div>`)
        }

        return details.length > 0 ? details.join('') : '<div class="no-detail">暂无详细信息</div>'
    }

    // Pay_Process - 支付流程日志
    if (eventName === 'Pay_Process') {
        // process_type 处理
        const processType = props.process_type || props.type || ''
        if (processType) {
            const typeInfo = PROCESS_TYPE_MAP[processType] || { name: processType, icon: '📍' }
            details.push(`<div class="pay-detail-item pay-process-type">
                <span class="pay-detail-icon">${typeInfo.icon}</span>
                <span class="pay-detail-label">流程类型:</span>
                <span class="pay-detail-value">${typeInfo.name}</span>
            </div>`)
        }

        // process_data 处理
        const processData = props.process_data || props.data || ''
        if (processData) {
            let dataDisplay = processData
            // 尝试解析JSON
            if (typeof processData === 'string') {
                try {
                    const parsed = JSON.parse(processData)
                    dataDisplay = `<pre class="pay-process-data">${JSON.stringify(parsed, null, 2)}</pre>`
                } catch (e) {
                    dataDisplay = `<span class="pay-detail-value">${processData}</span>`
                }
            } else if (typeof processData === 'object') {
                dataDisplay = `<pre class="pay-process-data">${JSON.stringify(processData, null, 2)}</pre>`
            }
            details.push(`<div class="pay-detail-item pay-data">
                <span class="pay-detail-icon">📋</span>
                <span class="pay-detail-label">流程数据:</span>
                ${dataDisplay}
            </div>`)
        }

        // process_status / status
        const processStatus = props.process_status || props.status || ''
        if (processStatus) {
            const statusInfo = PAY_PROCESS_STATUS[processStatus.toLowerCase()] || { text: processStatus, icon: '📍', color: '#666' }
            details.push(`<div class="pay-detail-item" style="color: ${statusInfo.color}">
                <span class="pay-detail-icon">${statusInfo.icon}</span>
                <span class="pay-detail-label">状态:</span>
                <span class="pay-detail-value">${statusInfo.text}</span>
            </div>`)
        }

        // 错误信息
        const errorMsg = props.error_msg || props.message || props.msg || ''
        if (errorMsg) {
            details.push(`<div class="pay-detail-item pay-error">
                <span class="pay-detail-icon">⚠️</span>
                <span class="pay-detail-label">消息:</span>
                <span class="pay-detail-value">${errorMsg}</span>
            </div>`)
        }

        return details.length > 0 ? details.join('') : '<div class="no-detail">暂无详细信息</div>'
    }

    // BecomMemberPop_Exposure - 会员弹窗曝光
    if (eventName === 'BecomMemberPop_Exposure') {
        const source = props.source || props.from || props.trigger || ''
        if (source) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">📍</span>
                <span class="pay-detail-label">触发来源:</span>
                <span class="pay-detail-value">${source}</span>
            </div>`)
        }

        const pagePath = props.page_name || props.page_path || ''
        if (pagePath) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">📄</span>
                <span class="pay-detail-label">所在页面:</span>
                <span class="pay-detail-value">${pagePath}</span>
            </div>`)
        }
    }

    // 通用字段处理（其他支付相关事件）
    // 金额
    const amount = props.amount || props.price || props.pay_amount || props.total_fee
    if (amount) {
        details.push(`<div class="pay-detail-item pay-amount">
            <span class="pay-detail-icon">💰</span>
            <span class="pay-detail-label">金额:</span>
            <span class="pay-detail-value">¥${amount}</span>
        </div>`)
    }

    // 商品/VIP类型
    const productName = props.product_name || props.goods_name || props.sku_name || props.vip_type
    if (productName) {
        details.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">📦</span>
            <span class="pay-detail-label">商品:</span>
            <span class="pay-detail-value">${productName}</span>
        </div>`)
    }

    // 订单号
    const orderId = props.order_id || props.order_no || props.out_trade_no
    if (orderId) {
        details.push(`<div class="pay-detail-item pay-order">
            <span class="pay-detail-icon">🔖</span>
            <span class="pay-detail-label">订单号:</span>
            <span class="pay-detail-value">${orderId}</span>
        </div>`)
    }

    // 书籍信息
    const bookName = props.book_name || props.novel_name
    if (bookName) {
        details.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">📚</span>
            <span class="pay-detail-label">书籍:</span>
            <span class="pay-detail-value">${bookName}</span>
        </div>`)
    }

    return details.length > 0 ? details.join('') : '<div class="no-detail">暂无详细信息</div>'
}

// 检查是否需要显示详情tooltip的事件
function hasDetailTooltip(item) {
    const eventInfo = EVENT_MAP[item.event]
    return item.category === 'pay' || (eventInfo && (eventInfo.isPay || eventInfo.hasTooltip))
}

// 获取tooltip图标
function getTooltipIcon(item) {
    const eventInfo = EVENT_MAP[item.event]
    if (eventInfo && eventInfo.tooltipIcon) {
        return eventInfo.tooltipIcon
    }
    return item.category === 'pay' ? '💳' : '📋'
}

// 更新事件筛选器
function updateEventFilter() {
    const eventTypes = [...new Set(allData.map((d) => d.event))].sort()
    eventFilter.innerHTML = '<option value="">全部事件</option>'
    eventTypes.forEach((event) => {
        const info = EVENT_MAP[event] || { desc: '未知事件' }
        const option = document.createElement('option')
        option.value = event
        option.textContent = `${event} (${info.desc})`
        eventFilter.appendChild(option)
    })
}

// 应用筛选
function applyFilters() {
    const eventValue = eventFilter.value
    const categoryValue = categoryFilter.value
    const searchValue = searchInput.value.toLowerCase()

    filteredData = allData.filter((item) => {
        // 事件筛选
        if (eventValue && item.event !== eventValue) return false

        // 分类筛选
        if (categoryValue && item.category !== categoryValue) return false

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

// 渲染表格
function renderTable() {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const pageData = filteredData.slice(start, end)

    tableBody.innerHTML = pageData
        .map((item) => {
            const showTooltip = hasDetailTooltip(item)
            const tooltipIcon = getTooltipIcon(item)
            const isPay = item.category === 'pay'
            const descContent = showTooltip
                ? `<div class="pay-desc-wrapper" onmouseenter="showPayTooltip(event, this)" onmouseleave="hidePayTooltip()">
                           <div class="pay-desc-trigger ${isPay ? '' : 'tooltip-trigger-read'}">
                               <span class="pay-icon">${tooltipIcon}</span>
                               <span>${item.desc}</span>
                           </div>
                           <div class="pay-tooltip ${isPay ? '' : 'tooltip-read'}">
                               <div class="pay-tooltip-title">${item.desc}</div>
                               <div class="pay-tooltip-detail">${item.detail}</div>
                               <div class="pay-tooltip-info">${getPayEventDetail(item)}</div>
                           </div>
                       </div>`
                : `<div>${item.desc}</div><div class="event-desc">${item.detail}</div>`

            return `
        <tr class="${isPay ? 'pay-row' : ''}">
            <td>${item.index}</td>
            <td class="time-cell">${item.time || '-'}</td>
            <td>
                <span class="event-badge ${CATEGORY_STYLES[item.category] || 'event-custom'}">${item.event}</span>
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
        </tr>
    `
        })
        .join('')
}

// 格式化属性显示
function formatProperties(props) {
    if (!props || Object.keys(props).length === 0) return '-'
    try {
        return JSON.stringify(props, null, 2)
    } catch (e) {
        return String(props)
    }
}

// 获取属性数量
function getPropertiesCount(props) {
    if (!props || Object.keys(props).length === 0) return '无属性'
    const count = Object.keys(props).length
    return `${count} 个属性`
}

// 显示tooltip
function showTooltip(event, cell) {
    const tooltip = cell.querySelector('.properties-tooltip')
    if (!tooltip) return

    const rect = cell.getBoundingClientRect()
    tooltip.style.display = 'block'
    const tooltipRect = tooltip.getBoundingClientRect()
    const tooltipWidth = tooltipRect.width || 400
    const tooltipHeight = tooltipRect.height || 300

    // 计算位置，紧贴在元素左侧
    let left = rect.left - tooltipWidth - 8
    let top = rect.top

    // 如果左侧空间不够，显示在右侧
    if (left < 10) {
        left = rect.right + 8
    }
    // 如果右侧也不够，显示在下方
    if (left + tooltipWidth > window.innerWidth - 10) {
        left = rect.left
        top = rect.bottom + 4
    }
    // 确保不超出底部
    if (top + tooltipHeight > window.innerHeight - 10) {
        top = window.innerHeight - tooltipHeight - 10
    }
    // 确保不超出顶部
    if (top < 10) {
        top = 10
    }

    tooltip.style.left = left + 'px'
    tooltip.style.top = top + 'px'
}

// 隐藏tooltip
function hideTooltip() {
    const tooltips = document.querySelectorAll('.properties-tooltip')
    tooltips.forEach((t) => (t.style.display = 'none'))
}

// 显示支付详情tooltip
function showPayTooltip(event, wrapper) {
    const tooltip = wrapper.querySelector('.pay-tooltip')
    if (!tooltip) return

    const rect = wrapper.getBoundingClientRect()
    tooltip.style.display = 'block'
    const tooltipRect = tooltip.getBoundingClientRect()
    const tooltipWidth = tooltipRect.width || 320
    const tooltipHeight = tooltipRect.height || 200

    // 计算位置，紧贴在元素下方
    let left = rect.left
    let top = rect.bottom + 4

    // 如果下方空间不够，显示在上方
    if (top + tooltipHeight > window.innerHeight - 10) {
        top = rect.top - tooltipHeight - 4
    }
    // 确保不超出右侧
    if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10
    }
    // 确保不超出左侧
    if (left < 10) {
        left = 10
    }
    // 确保不超出顶部
    if (top < 10) {
        top = rect.bottom + 4
    }

    tooltip.style.left = left + 'px'
    tooltip.style.top = top + 'px'
}

// 隐藏支付详情tooltip
function hidePayTooltip() {
    const tooltips = document.querySelectorAll('.pay-tooltip')
    tooltips.forEach((t) => (t.style.display = 'none'))
}

// 渲染分页
function renderPagination() {
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
function goToPage(page) {
    const totalPages = Math.ceil(filteredData.length / pageSize)
    if (page < 1 || page > totalPages) return
    currentPage = page
    renderTable()
    renderPagination()
    document.querySelector('.table-container').scrollTop = 0
}

// 导出筛选结果
function exportFilteredData() {
    if (filteredData.length === 0) {
        alert('没有可导出的数据')
        return
    }

    const exportData = filteredData.map((item) => ({
        序号: item.index,
        时间: item.time,
        事件名称: item.event,
        事件描述: item.desc,
        分类: CATEGORY_NAMES[item.category] || '其他',
        页面路径: item.pagePath,
        事件属性: JSON.stringify(item.properties),
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '埋点分析结果')

    const fileName = `埋点分析结果_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(wb, fileName)
}

// 工具函数：格式化时间（显示到毫秒）
function formatTimeWithMs(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const ms = String(date.getMilliseconds()).padStart(3, '0')
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}.${ms}`
}

// 工具函数：格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 工具函数：防抖
function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}
