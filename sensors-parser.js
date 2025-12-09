/**
 * 神策埋点日志解析器
 * 解析从神策导出的 Excel 文件
 */

import { formatTimeWithMs, CATEGORY_NAMES } from './common.js'

// 神策事件描述映射表
export const SENSORS_EVENT_MAP = {
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

// 支付流程状态映射
export const PAY_PROCESS_STATUS = {
    start: { text: '开始支付', icon: '🚀', color: '#2196f3' },
    request: { text: '发起请求', icon: '📤', color: '#ff9800' },
    success: { text: '支付成功', icon: '✅', color: '#4caf50' },
    fail: { text: '支付失败', icon: '❌', color: '#f44336' },
    cancel: { text: '取消支付', icon: '🚫', color: '#9e9e9e' },
    complete: { text: '流程完成', icon: '🏁', color: '#673ab7' },
    error: { text: '发生错误', icon: '⚠️', color: '#ff5722' },
}

// 支付流程类型映射
export const PROCESS_TYPE_MAP = {
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

/**
 * 解析神策Excel数据
 */
export function parseSensorsData(jsonData) {
    const allData = jsonData.map((row, index) => {
        const eventName = row.event || row.Event || row['event'] || row['$event'] || ''
        const eventInfo = SENSORS_EVENT_MAP[eventName] || {
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
                timestamp = timeRaw > 9999999999 ? timeRaw : timeRaw * 1000
                timeStr = formatTimeWithMs(new Date(timestamp))
            } else if (typeof timeRaw === 'string') {
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

        // 获取页面路径
        const pagePath = row.page_name || row['page_name'] || ''

        // 获取属性数据
        let properties = {}
        const baseFields = ['event', 'Event', 'time', 'Time', '$time', 'distinct_id', 'user_id', '$user_id']
        Object.keys(row).forEach((key) => {
            if (!baseFields.includes(key)) {
                const value = row[key]
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

    return allData
}

/**
 * 获取支付事件详细描述
 */
export function getPayEventDetail(item) {
    const props = item.properties || {}
    const eventName = item.event
    let details = []

    // ReadDeatilPage_ButtonClick - 阅读页按钮点击
    if (eventName === 'ReadDeatilPage_ButtonClick') {
        const buttonName = props.button_name || props.buttonName || props.btn_name || ''
        if (buttonName) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">👆</span>
                <span class="pay-detail-label">按钮名称:</span>
                <span class="pay-detail-value" style="font-weight: bold; color: #81c784">${buttonName}</span>
            </div>`)
        }

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
        const isUnlock = props.is_unlock
        if (isUnlock !== undefined && isUnlock !== null) {
            const unlocked = isUnlock === true || isUnlock === 'true' || isUnlock === 1 || isUnlock === '1'
            details.push(`<div class="pay-detail-item" style="color: ${unlocked ? '#4caf50' : '#f44336'}">
                <span class="pay-detail-icon">${unlocked ? '✅' : '❌'}</span>
                <span class="pay-detail-label">解锁状态:</span>
                <span class="pay-detail-value" style="font-weight: bold">${unlocked ? '已解锁' : '未解锁'}</span>
            </div>`)
        }

        const bookName = props.book_name || props.novel_name
        if (bookName) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">📚</span>
                <span class="pay-detail-label">书籍:</span>
                <span class="pay-detail-value">${bookName}</span>
            </div>`)
        }

        const chapterName = props.chapter_name || props.chapter_title
        if (chapterName) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">📖</span>
                <span class="pay-detail-label">章节:</span>
                <span class="pay-detail-value">${chapterName}</span>
            </div>`)
        }

        const chapterId = props.chapter_id
        if (chapterId) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">🔢</span>
                <span class="pay-detail-label">章节ID:</span>
                <span class="pay-detail-value">${chapterId}</span>
            </div>`)
        }

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

        const amount = props.order_amount
        if (amount) {
            details.push(`<div class="pay-detail-item pay-amount">
                <span class="pay-detail-icon">💰</span>
                <span class="pay-detail-label">金额:</span>
                <span class="pay-detail-value">¥${amount}</span>
            </div>`)
        }

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
        const processType = props.process_type || props.type || ''
        if (processType) {
            const typeInfo = PROCESS_TYPE_MAP[processType] || { name: processType, icon: '📍' }
            details.push(`<div class="pay-detail-item pay-process-type">
                <span class="pay-detail-icon">${typeInfo.icon}</span>
                <span class="pay-detail-label">流程类型:</span>
                <span class="pay-detail-value">${typeInfo.name}</span>
            </div>`)
        }

        const processData = props.process_data || props.data || ''
        if (processData) {
            let dataDisplay = processData
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

        const processStatus = props.process_status || props.status || ''
        if (processStatus) {
            const statusInfo = PAY_PROCESS_STATUS[processStatus.toLowerCase()] || { text: processStatus, icon: '📍', color: '#666' }
            details.push(`<div class="pay-detail-item" style="color: ${statusInfo.color}">
                <span class="pay-detail-icon">${statusInfo.icon}</span>
                <span class="pay-detail-label">状态:</span>
                <span class="pay-detail-value">${statusInfo.text}</span>
            </div>`)
        }

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

    // 通用字段处理
    const amount = props.amount || props.price || props.pay_amount || props.total_fee
    if (amount) {
        details.push(`<div class="pay-detail-item pay-amount">
            <span class="pay-detail-icon">💰</span>
            <span class="pay-detail-label">金额:</span>
            <span class="pay-detail-value">¥${amount}</span>
        </div>`)
    }

    const productName = props.product_name || props.goods_name || props.sku_name || props.vip_type
    if (productName) {
        details.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">📦</span>
            <span class="pay-detail-label">商品:</span>
            <span class="pay-detail-value">${productName}</span>
        </div>`)
    }

    const orderId = props.order_id || props.order_no || props.out_trade_no
    if (orderId) {
        details.push(`<div class="pay-detail-item pay-order">
            <span class="pay-detail-icon">🔖</span>
            <span class="pay-detail-label">订单号:</span>
            <span class="pay-detail-value">${orderId}</span>
        </div>`)
    }

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

/**
 * 检查是否需要显示详情tooltip的事件
 */
export function hasDetailTooltip(item) {
    const eventInfo = SENSORS_EVENT_MAP[item.event]
    return item.category === 'pay' || (eventInfo && (eventInfo.isPay || eventInfo.hasTooltip))
}

/**
 * 获取tooltip图标
 */
export function getTooltipIcon(item) {
    const eventInfo = SENSORS_EVENT_MAP[item.event]
    if (eventInfo && eventInfo.tooltipIcon) {
        return eventInfo.tooltipIcon
    }
    return item.category === 'pay' ? '💳' : '📋'
}

/**
 * 导出筛选结果为Excel
 */
export function exportToExcel(filteredData) {
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

