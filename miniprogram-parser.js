/**
 * 小程序日志解析器
 * 解析从 Grafana 导出的 JSON 日志文件
 */

import { formatTimeWithMs, CATEGORY_NAMES } from './common.js'

// 小程序API操作事件映射
export const MINIPROGRAM_EVENT_MAP = {
    // ========== 用户认证相关 ==========
    '/api.miniprogram.v1.Auth/Login': {
        desc: '用户登录',
        category: 'system',
        detail: '用户登录小程序',
        icon: '👤',
    },
    '/api.miniprogram.v1.Auth/GetUserInfo': {
        desc: '获取用户信息',
        category: 'system',
        detail: '获取当前登录用户信息',
        icon: '👤',
    },

    // ========== 书籍相关 ==========
    '/api.miniprogram.v1.Book/GetBookInfo': {
        desc: '获取书籍信息',
        category: 'read',
        detail: '获取书籍详情信息',
        icon: '📖',
    },
    '/api.miniprogram.v1.Book/GetChapterList': {
        desc: '获取章节列表',
        category: 'read',
        detail: '获取书籍的章节目录',
        icon: '📑',
    },
    '/api.miniprogram.v1.Book/GetChapterContent': {
        desc: '获取章节内容',
        category: 'read',
        detail: '获取章节的文字内容',
        icon: '📖',
    },
    '/api.miniprogram.v1.Book/SetReadProgress': {
        desc: '设置阅读进度',
        category: 'read',
        detail: '设置用户阅读进度',
        icon: '📖',
    },
    '/api.miniprogram.v1.Book/GetBookChapter': {
        desc: '获取章节',
        category: 'read',
        detail: '获取书籍章节详情',
        icon: '📖',
    },
    '/api.miniprogram.v1.Book/GetBook': {
        desc: '获取书籍',
        category: 'read',
        detail: '获取书籍详情',
        icon: '📖',
    },
    '/api.miniprogram.v1.Bookshop/ListRecommendedBooks': {
        desc: '获取推荐书籍',
        category: 'read',
        detail: '获取推荐书籍列表',
        icon: '📖',
    },
    '/api.miniprogram.v1.Bookshop/ListMoreBooks': {
        desc: '首页书籍列表',
        category: 'read',
        detail: '获取首页书籍列表',
        icon: '📖',
    },
    '/api.miniprogram.v1.Bookshop/GetRecentlyReadBook': {
        desc: '最近阅读',
        category: 'read',
        detail: '获取最近阅读书籍',
        icon: '📖',
    },
    '/api.miniprogram.v1.Book/UnlockBookIaa': {
        desc: 'IAA解锁书籍',
        category: 'ad',
        detail: '通过看广告解锁书籍章节',
        icon: '🔓',
        hasTooltip: true,
    },
    '/api.miniprogram.v1.Book/UnlockBookIap': {
        desc: 'IAP解锁书籍',
        category: 'pay',
        detail: '通过付费解锁书籍章节',
        icon: '💰',
        hasTooltip: true,
    },
    '/api.miniprogram.v1.Book/AddToBookshelf': {
        desc: '加入书架',
        category: 'custom',
        detail: '将书籍加入用户书架',
        icon: '📚',
    },

    // ========== 广告相关 ==========
    '/api.miniprogram.v1.Ad/GetUserAdFree': {
        desc: '获取免广告状态',
        category: 'ad',
        detail: '查询用户是否有免广告特权',
        icon: '🎫',
    },
    '/api.miniprogram.v1.Ad/GetAdConfig': {
        desc: '获取广告配置',
        category: 'ad',
        detail: '获取广告位配置信息',
        icon: '⚙️',
    },

    // ========== 上报相关 ==========
    '/api.miniprogram.v1.Report/ReportAdWatchHistory': {
        desc: '上报广告观看记录',
        category: 'ad',
        detail: '上报用户观看广告的记录',
        icon: '📊',
        hasTooltip: true,
    },
    '/api.miniprogram.v1.Report/ReportActivation': {
        desc: '上报激活',
        category: 'channel',
        detail: '上报用户激活事件',
        icon: '🎯',
    },
    '/api.miniprogram.v1.Report/ReportAnalysis': {
        desc: '上报分析数据',
        category: 'custom',
        detail: '上报日志分析数据',
        icon: '📈',
    },

    // ========== 首页/书城相关 ==========
    '/api.miniprogram.v1.Home/GetHomeData': {
        desc: '获取首页数据',
        category: 'custom',
        detail: '获取书城首页推荐数据',
        icon: '🏠',
    },
    '/api.miniprogram.v1.Home/GetBannerList': {
        desc: '获取轮播图',
        category: 'custom',
        detail: '获取首页轮播图列表',
        icon: '🎠',
    },
    '/api.miniprogram.v1.Home/GetBookList': {
        desc: '获取书籍列表',
        category: 'custom',
        detail: '获取书籍列表数据',
        icon: '📚',
    },
    '/api.miniprogram.v1.Bookshelf/GetBookshelfRecords': {
        desc: '书架记录',
        category: 'custom',
        detail: '获取书架记录',
        icon: '📚',
    },
    '/api.miniprogram.v1.Report/GetServerTime': {
        desc: '服务器时间',
        category: 'system',
        detail: '获取服务器时间来校准客户端时间',
        icon: '🕒',
    },

    // ========== 搜索相关 ==========
    '/api.miniprogram.v1.Search/SearchBook': {
        desc: '搜索书籍',
        category: 'search',
        detail: '根据关键词搜索书籍',
        icon: '🔍',
    },
    '/api.miniprogram.v1.Search/GetHotKeywords': {
        desc: '获取热搜词',
        category: 'search',
        detail: '获取热门搜索关键词',
        icon: '🔥',
    },

    // ========== 订单/支付相关 ==========
    '/api.miniprogram.v1.Order/CreateOrder': {
        desc: '创建订单',
        category: 'pay',
        detail: '创建支付订单',
        icon: '📝',
        hasTooltip: true,
    },
    '/api.miniprogram.v1.Order/GetOrderStatus': {
        desc: '查询订单状态',
        category: 'pay',
        detail: '查询订单支付状态',
        icon: '🔄',
    },
    '/api.miniprogram.v1.Order/GetOrderList': {
        desc: '获取订单列表',
        category: 'pay',
        detail: '获取用户订单历史',
        icon: '📋',
    },

    // ========== 配置相关 ==========
    '/api.miniprogram.v1.Config/GetAppConfig': {
        desc: '获取应用配置',
        category: 'system',
        detail: '获取小程序配置信息',
        icon: '⚙️',
    },
}

// 日志消息类型映射
export const LOG_MSG_MAP = {
    'request log': {
        desc: 'API请求日志',
        category: 'api',
        icon: '🌐',
    },
    '发布事件': {
        desc: '事件发布',
        category: 'system',
        icon: '📤',
    },
}

// 事件名称映射
export const EVENT_NAME_MAP = {
    'ad_watch_start': {
        desc: '广告观看开始',
        category: 'ad',
        detail: '用户开始观看激励视频广告',
        icon: '▶️',
    },
    'user_register': {
        desc: '用户注册',
        category: 'system',
        detail: '用户注册事件',
        icon: '👤',
    },
    'ad_watch_end': {
        desc: '广告观看结束',
        category: 'ad',
        detail: '用户完成激励视频广告观看',
        icon: '⏹️',
    },
    'book_unlock': {
        desc: '书籍解锁',
        category: 'read',
        detail: '书籍章节解锁事件',
        icon: '🔓',
    },
    'user_login': {
        desc: '用户登录',
        category: 'system',
        detail: '用户登录事件',
        icon: '🔐',
    },
    'analysis_generic': {
        desc: '上报分析数据',
        category: 'custom',
        detail: '上报分析数据',
        icon: '📈',
    },
}

function parseFailReason(raw) {
    if (raw === undefined || raw === null) return ''
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw)
            return parseFailReason(parsed)
        } catch {
            return raw
        }
    }
    if (typeof raw === 'object') {
        const entries = Object.entries(raw).map(([k, v]) => `${k}: ${parseFailReason(v)}`)
        return entries.join('\n')
    }
    return String(raw)
}

/**
 * 解析小程序JSON日志数据
 */
export function parseMiniprogramData(jsonData) {
    const allData = []

    jsonData.forEach((record, index) => {
        try {
            // 解析 line 字段中的 JSON
            let lineData = null
            if (record.line) {
                lineData = typeof record.line === 'string' ? JSON.parse(record.line) : record.line
            } else {
                lineData = typeof record === 'string' ? JSON.parse(record) : record
            }
            // 提取时间
            let timeStr = ''
            let timestamp = 0
            if (lineData.time) {
                const parsed = new Date(lineData.time)
                if (!isNaN(parsed.getTime())) {
                    timestamp = parsed.getTime()
                    timeStr = formatTimeWithMs(parsed)
                }
            } else if (record.timestamp) {
                // Loki的纳秒时间戳
                timestamp = Math.floor(parseInt(record.timestamp) / 1000000)
                timeStr = formatTimeWithMs(new Date(timestamp))
            }

            // level
            const level = (lineData.level || '').toUpperCase()

            // 确定事件类型和描述
            let eventName = ''
            let eventDesc = ''
            let eventDetail = ''
            let category = 'custom'
            let icon = '📋'

            // 检查是否是API请求日志
            if (lineData.operation) {
                eventName = lineData.operation
                const eventInfo = MINIPROGRAM_EVENT_MAP[lineData.operation] || {
                    desc: lineData.operation.split('/').pop() || '未知操作',
                    category: 'api',
                    detail: `API: ${lineData.operation}`,
                    icon: '🌐',
                }
                eventDesc = eventInfo.desc
                eventDetail = eventInfo.detail
                category = eventInfo.category
                icon = eventInfo.icon || '🌐'
            }
            // 检查是否是事件发布日志
            else if (lineData.eventName) {
                eventName = lineData.eventName
                const eventInfo = EVENT_NAME_MAP[lineData.eventName] || {
                    desc: lineData.eventName,
                    category: 'system',
                    detail: `事件: ${lineData.eventName}`,
                    icon: '📤',
                }
                eventDesc = eventInfo.desc
                eventDetail = eventInfo.detail
                category = eventInfo.category
                icon = eventInfo.icon || '📤'
            }
            // 其他日志
            else {
                eventName = lineData.msg || 'unknown'
                const msgInfo = LOG_MSG_MAP[lineData.msg] || {
                    desc: lineData.msg || '未知消息',
                    category: 'system',
                    icon: '📋',
                }
                eventDesc = msgInfo.desc
                eventDetail = lineData.message || lineData.msg || ''
                category = msgInfo.category
                icon = msgInfo.icon || '📋'
            }

            // 提取用户信息
            const user = lineData.user || {}
            const userId = user.id || user.openId || ''

            // 提取页面路径
            const userAttributes = lineData.userAttributes ||
                                   lineData.args?.adWatchHistory?.userAttributes ||
                                   lineData.event?.userAttributes || {}
            const analysisData = lineData.analysisData ||
                                 lineData.args?.adWatchHistory?.analysisData ||
                                 lineData.event?.analysisData || {}
            const pagePath = userAttributes.path || analysisData.path || ''

            // 构建属性对象
            const properties = {
                // 基础信息
                level: level || undefined,
                code: lineData.code,
                reason: lineData.reason,
                stack: lineData.stack,
                userAgent: lineData.userAgent,
                latency: lineData.latency,
                traceId: lineData.traceId,
                spanId: lineData.spanId,
                serviceId: lineData.serviceId,
                serviceName: lineData.serviceName,
                serviceVersion: lineData.serviceVersion,
                ip: lineData.ip,
                // 用户信息
                userId: user.id,
                openId: user.openId,
                miniprogramId: user.miniprogramId || userAttributes.miniprogramId,
                miniprogramName: userAttributes.miniprogramName,
                miniprogramAppId: userAttributes.miniprogramAppId,
                // 设备信息
                deviceId: userAttributes.deviceId || analysisData.device_id,
                os: userAttributes.os,
                osVersion: userAttributes.osVersion,
                deviceModel: userAttributes.deviceModel,
                deviceManufacturer: userAttributes.deviceManufacturer,
                browser: userAttributes.browser,
                browserVersion: userAttributes.browserVersion,
                networkType: userAttributes.networkType,
                // 来源信息
                fromType: userAttributes.fromType,
                linkId: userAttributes.linkId,
                // 书籍信息
                bookId: userAttributes.bookId || analysisData.book_id || lineData.args?.bookId,
                bookName: analysisData.book_name,
                chapterId: userAttributes.chapterId || lineData.args?.chapterId,
                // 广告信息
                adType: analysisData.ad_type,
                adId: analysisData.ad_id,
                isSuccess: analysisData.is_success,
                // 优先 analysisData.fail_reason，再兼容 lineData.failReason / fail_reason
                failReason: analysisData.fail_reason || analysisData.failReason || lineData.failReason || lineData.fail_reason,
                watchtime: analysisData.watchtime,
                readProgress: analysisData.read_progress,
                // 事件相关
                eventName: lineData.eventName,
                topic: lineData.topic,
                // 请求参数
                args: lineData.args,
                // 原始分析数据
                analysisData: analysisData,
            }

            // 过滤掉空值
            Object.keys(properties).forEach(key => {
                if (properties[key] === undefined || properties[key] === null || properties[key] === '') {
                    delete properties[key]
                }
            })

            const failReasonText = parseFailReason(properties.failReason)

            // 从failReason中提取response的code和message，以及error信息
            let responseCode = null
            let responseMessage = null
            let errorMessage = null
            if (properties.failReason) {
                const reasonStr = String(properties.failReason)
                // 解析 [response] 部分
                const responseMatch = reasonStr.match(/\[response\]:\s*\n?\s*(\{[\s\S]*?\})(?=\n?\s*\[|$)/)
                if (responseMatch) {
                    try {
                        const responseData = JSON.parse(responseMatch[1])
                        // 提取code（可能在data.code或statusCode）
                        responseCode = responseData.data?.code || responseData.statusCode || responseData.code
                        // 提取message（可能在data.message）
                        responseMessage = responseData.data?.message || responseData.message
                    } catch (e) {
                        // 解析失败，忽略
                    }
                }
                
                // 解析 [error] 部分
                const errorMatch = reasonStr.match(/\[error\]:\s*\n?\s*(.+?)(?=\n?\s*\[|$)/s)
                if (errorMatch) {
                    const errorContent = errorMatch[1].trim()
                    // 尝试作为JSON解析，如果失败则作为纯文本处理
                    try {
                        if (errorContent.startsWith('{') && errorContent.endsWith('}')) {
                            const errorData = JSON.parse(errorContent)
                            errorMessage = errorData.message || errorContent
                        } else {
                            // 纯文本错误信息
                            errorMessage = errorContent
                        }
                    } catch (e) {
                        // 解析失败，使用原始内容
                        errorMessage = errorContent
                    }
                }
            }

            allData.push({
                originalIndex: index + 1,
                time: timeStr,
                timestamp: timestamp,
                event: eventName,
                desc: eventDesc,
                detail: eventDetail,
                category: category,
                icon: icon,
                userId: userId,
                level: level,
                pagePath: pagePath,
                properties: properties,
                rawData: lineData,
                hasTooltip: MINIPROGRAM_EVENT_MAP[eventName]?.hasTooltip ||
                           EVENT_NAME_MAP[eventName]?.hasTooltip ||
                           category === 'ad' || category === 'pay' ||
                           (level === 'ERROR' && !!failReasonText),
                failReason: failReasonText,
                responseCode: responseCode,
                responseMessage: responseMessage,
                errorMessage: errorMessage,
            })
        } catch (e) {
            console.warn('解析日志记录失败:', e, record)
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
 * 生成树形结构的HTML
 */
function generateTreeStructure(data, sectionTitle, sectionIcon, copyData = null) {
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        return ''
    }

    const treeId = `tree-${sectionTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    let html = `<div class="tree-section collapsed" id="${treeId}">
        <div class="tree-section-header" onclick="toggleTreeSection('${treeId}')">
            <span class="tree-toggle">▶</span>
            <span>${sectionIcon}</span>
            <span>[${sectionTitle}]</span>`

    if (copyData) {
        html += `<button class="tree-section-copy" data-copy="${encodeURIComponent(JSON.stringify(data, null, 2))}" onclick="copyData(this)">复制</button>`
    }

    html += `        </div>
        <div class="tree-section-content">
            ${generateTreeNodes(data, 0)}
        </div>
    </div>`

    return html
}

/**
 * 生成树形节点
 */
function generateTreeNodes(data, depth = 0, path = '') {
    if (data === null || data === undefined) {
        return `<div class="tree-leaf" data-depth="${depth}"><span class="tree-leaf-key">${path}:</span> <span class="tree-leaf-value">${data}</span></div>`
    }

    if (typeof data !== 'object') {
        const value = typeof data === 'string' ? `"${data}"` : data
        return `<div class="tree-leaf" data-depth="${depth}"><span class="tree-leaf-key">${path}:</span> <span class="tree-leaf-value">${value}</span></div>`
    }

    if (Array.isArray(data)) {
        if (data.length === 0) {
            return `<div class="tree-leaf" data-depth="${depth}"><span class="tree-leaf-key">${path}:</span> <span class="tree-leaf-value">[]</span></div>`
        }

        let html = ''
        data.forEach((item, index) => {
            const itemPath = path ? `${path}[${index}]` : `[${index}]`
            html += generateTreeNodes(item, depth, itemPath)
        })
        return html
    }

    // 对象类型
    const keys = Object.keys(data)
    if (keys.length === 0) {
        return `<div class="tree-leaf" data-depth="${depth}"><span class="tree-leaf-key">${path}:</span> <span class="tree-leaf-value">{}</span></div>`
    }

    if (depth >= 3) { // 限制深度，避免无限递归
        return `<div class="tree-leaf" data-depth="${depth}"><span class="tree-leaf-key">${path}:</span> <span class="tree-leaf-value">{...}</span></div>`
    }

    let html = ''
    keys.forEach(key => {
        const value = data[key]
        const fullPath = path ? `${path}.${key}` : key
        const nodeId = `node-${fullPath.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
            html += `<div class="tree-node collapsed" data-depth="${depth}" id="${nodeId}">
                <div class="tree-node-header" onclick="toggleTreeNode('${nodeId}')">
                    <span class="tree-node-icon">▶</span>
                    <span class="tree-node-value">${key}</span>
                </div>
                <div class="tree-node-children" data-depth="${depth + 1}">
                    ${generateTreeNodes(value, depth + 1, fullPath)}
                </div>
            </div>`
        } else {
            const displayValue = value === null ? 'null' :
                               value === undefined ? 'undefined' :
                               typeof value === 'string' ? `"${value}"` : value
            html += `<div class="tree-leaf" data-depth="${depth}">
                <span class="tree-leaf-key">${key}:</span>
                <span class="tree-leaf-value">${displayValue}</span>
            </div>`
        }
    })

    return html
}

/**
 * 获取小程序事件详细描述
 */
export function getMiniprogramEventDetail(item) {
    const props = item.properties || {}
    const raw = item.rawData || {}
    let details = []

    const encodeHtml = (str = '') =>
        String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')

    const formatJson = (val) => {
        if (val === undefined || val === null) return ''
        if (typeof val === 'string') {
            try {
                const parsed = JSON.parse(val)
                return JSON.stringify(parsed, null, 2)
            } catch {
                return val
            }
        }
        return JSON.stringify(val, null, 2)
    }

    // ERROR级别记录的特殊处理
    if (item.level === 'ERROR') {
        // 错误代码和原因
        if (props.code !== undefined) {
            const codeClass = props.code >= 400 && props.code < 500 ? 'pay-error' :
                             props.code >= 500 ? 'pay-error' : ''
            details.push(`<div class="pay-detail-item pay-error-code">
                <span class="pay-detail-icon">🔴</span>
                <span class="pay-detail-label">错误代码:</span>
                <span class="pay-detail-value ${codeClass}"><strong>${props.code}</strong></span>
            </div>`)
        }

        if (props.reason) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">📋</span>
                <span class="pay-detail-label">错误原因:</span>
                <span class="pay-detail-value">${encodeHtml(props.reason)}</span>
            </div>`)
        }

        // 错误堆栈信息
        if (props.stack) {
            const stackText = encodeHtml(props.stack)
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">📄</span>
                <span class="pay-detail-label">错误堆栈:</span>
                <span class="pay-detail-value">
                    <pre style="white-space: pre-wrap; margin: 0; font-size: 12px; max-height: 200px; overflow-y: auto;">${stackText}</pre>
                    <button class="copy-btn" data-copy="${encodeURIComponent(props.stack)}" onclick="copyData(this)">复制</button>
                </span>
            </div>`)
        }

        // 失败原因详情（从analysisData中提取）
        // const failReason = raw.analysisData?.fail_reason || props.fail_reason
        // if (failReason) {
        //     const frText = encodeHtml(failReason)
        //     details.push(`<div class="pay-detail-item">
        //         <span class="pay-detail-icon">⚠️</span>
        //         <span class="pay-detail-label">失败详情:</span>
        //         <span class="pay-detail-value">
        //             <pre style="white-space: pre-wrap; margin: 0; font-size: 12px; max-height: 150px; overflow-y: auto;">${frText}</pre>
        //             <button class="copy-btn" data-copy="${encodeURIComponent(failReason)}" onclick="copyData(this)">复制</button>
        //         </span>
        //     </div>`)
        // }

        // 请求延迟信息（针对API错误）
        if (props.latency) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">⏱️</span>
                <span class="pay-detail-label">请求耗时:</span>
                <span class="pay-detail-value">${(props.latency * 1000).toFixed(2)}ms</span>
            </div>`)
        }

        // 添加分隔线
        if (details.length > 0) {
            details.push('<hr style="margin: 12px 0; border: none; border-top: 1px solid rgba(255,255,255,0.1);">')
        }
    }

    // 用户信息
    if (props.userId || props.openId) {
        details.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">👤</span>
            <span class="pay-detail-label">用户ID:</span>
            <span class="pay-detail-value">${props.userId || props.openId}</span>
        </div>`)
        
    }
    if (props.ip) {
        details.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">🌍</span>
            <span class="pay-detail-label">用户IP:</span>
            <span class="pay-detail-value">${props.ip}</span>
        </div>`)
    }

    // 设备信息分组 - 放在用户信息之后，优先展示
    let hasDeviceInfo = false
    const deviceInfoDetails = []

    // 优先从 userAttributes 获取设备信息，fallback 到 properties
    const userAttributes = raw.args?.userAttributes || {}
    const getDeviceInfo = (field) => userAttributes[field] || props[field]

    // 设备品牌和型号
    const deviceManufacturer = getDeviceInfo('deviceManufacturer')
    const deviceModel = getDeviceInfo('deviceModel')
    if (deviceManufacturer || deviceModel) {
        deviceInfoDetails.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">📱</span>
            <span class="pay-detail-label">设备型号:</span>
            <span class="pay-detail-value">${deviceManufacturer || 'Unknown'} ${deviceModel || ''}</span>
        </div>`)
        hasDeviceInfo = true
    }

    // 操作系统信息
    const os = getDeviceInfo('os')
    const osVersion = getDeviceInfo('osVersion')
    if (os) {
        const versionStr = osVersion ? ` ${osVersion}` : ''
        deviceInfoDetails.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">💻</span>
            <span class="pay-detail-label">操作系统:</span>
            <span class="pay-detail-value">${os}${versionStr}</span>
        </div>`)
        hasDeviceInfo = true
    }

    // 浏览器信息
    const browser = getDeviceInfo('browser')
    const browserVersion = getDeviceInfo('browserVersion')
    if (browser) {
        const versionStr = browserVersion ? ` ${browserVersion}` : ''
        deviceInfoDetails.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">🌐</span>
            <span class="pay-detail-label">浏览器:</span>
            <span class="pay-detail-value">${browser}${versionStr}</span>
        </div>`)
        hasDeviceInfo = true
    }

    // 网络信息
    const networkType = getDeviceInfo('networkType')
    if (networkType) {
        deviceInfoDetails.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">📶</span>
            <span class="pay-detail-label">网络类型:</span>
            <span class="pay-detail-value">${networkType}</span>
        </div>`)
        hasDeviceInfo = true
    }

    // 如果有设备信息，则添加设备信息分组标题和内容
    if (hasDeviceInfo) {
        details.push('<div class="device-info-header" style="margin: 12px 0 8px 0; padding: 4px 8px; background: rgba(33, 150, 243, 0.1); border-radius: 4px; font-size: 12px; font-weight: bold; color: #2196f3;">📱 设备信息</div>')
        details.push(...deviceInfoDetails)
    }

    // 小程序启动路径（针对 user_login 事件）
    if (item.event === 'user_login') {
        const launchPath =
            props.launchPath ||
            props.launchpath ||
            props.analysisData?.launchPath ||
            props.analysisData?.launchpath ||
            raw.analysisData?.launchPath ||
            raw.analysisData?.launchpath
        const launchQuery =
            props.launchQuery ||
            props.launchquery ||
            props.analysisData?.launchQuery ||
            props.analysisData?.launchquery ||
            raw.analysisData?.launchQuery ||
            raw.analysisData?.launchquery

        if (launchPath) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">🛤️</span>
                <span class="pay-detail-label">launchPath:</span>
                <span class="pay-detail-value">${launchPath}</span>
            </div>`)
        }
        if (launchQuery && Object.keys(launchQuery || {}).length) {
            const queryJson = typeof launchQuery === 'string' ? launchQuery : JSON.stringify(launchQuery, null, 2)
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">🔎</span>
                <span class="pay-detail-label">launchQuery:</span>
                <span class="pay-detail-value"><pre style="white-space: pre-wrap; margin: 0;">${queryJson}</pre></span>
            </div>`)
        }
    }

    // 小程序信息
    if (props.miniprogramName) {
        details.push('<div class="device-info-header" style="margin: 12px 0 8px 0; padding: 4px 8px; background: rgba(33, 150, 243, 0.1); border-radius: 4px; font-size: 12px; font-weight: bold; color: #2196f3;">📱 小程序信息</div>')
        details.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">📱</span>
            <span class="pay-detail-label">小程序:</span>
            <span class="pay-detail-value">${props.miniprogramName}</span>
        </div>`)
        if (props.miniprogramAppId) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">📱</span>
                <span class="pay-detail-label">小程序AppID:</span>
                <span class="pay-detail-value">${props.miniprogramAppId}</span>
            </div>`)
        }
        if (props.platform_type) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">📱</span>
            <span class="pay-detail-label">平台类型:</span>
            <span class="pay-detail-value">${props.platform_type}</span>
        </div>`)
        }
        if (props.linkid) {
            details.push(`<div class="pay-detail-item">
                <span class="pay-detail-icon">📱</span>
                <span class="pay-detail-label">链接ID:</span>
                <span class="pay-detail-value">${props.linkid}</span>
            </div>`)
        }
    }

    // 书籍信息
    if (props.bookName) {
        details.push('<div class="device-info-header" style="margin: 12px 0 8px 0; padding: 4px 8px; background: rgba(33, 150, 243, 0.1); border-radius: 4px; font-size: 12px; font-weight: bold; color: #2196f3;">📚 书籍信息</div>')
        details.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">📚</span>
            <span class="pay-detail-label">书籍:</span>
            <span class="pay-detail-value">${props.bookName}</span>
        </div>`)
    }

    if (props.bookId) {
        details.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">🔢</span>
            <span class="pay-detail-label">书籍ID:</span>
            <span class="pay-detail-value">${props.bookId}</span>
        </div>`)
    }

    // 广告信息
    if (props.adType) {
        details.push('<div class="device-info-header" style="margin: 12px 0 8px 0; padding: 4px 8px; background: rgba(33, 150, 243, 0.1); border-radius: 4px; font-size: 12px; font-weight: bold; color: #2196f3;">📺 广告信息</div>')
        details.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">📺</span>
            <span class="pay-detail-label">广告类型:</span>
            <span class="pay-detail-value">${props.adType}</span>
        </div>`)
    }

    if (props.adId) {
        details.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">🎯</span>
            <span class="pay-detail-label">广告ID:</span>
            <span class="pay-detail-value">${props.adId}</span>
        </div>`)
    }

    if (props.watchtime !== undefined) {
        details.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">⏱️</span>
            <span class="pay-detail-label">观看时长:</span>
            <span class="pay-detail-value">${(props.watchtime / 1000).toFixed(2)}秒</span>
        </div>`)
    }

    // 成功/失败状态
    if (props.isSuccess !== undefined) {
        const success = props.isSuccess === true || props.isSuccess === 'true'
        details.push('<div class="device-info-header" style="margin: 12px 0 8px 0; padding: 4px 8px; background: rgba(33, 150, 243, 0.1); border-radius: 4px; font-size: 12px; font-weight: bold; color: #2196f3;">⚙️ 状态信息</div>')
        details.push(`<div class="pay-detail-item" style="color: ${success ? '#4caf50' : '#f44336'}">
            <span class="pay-detail-icon">${success ? '✅' : '❌'}</span>
            <span class="pay-detail-label">状态:</span>
            <span class="pay-detail-value" style="font-weight: bold">${success ? '成功' : '失败'}</span>
        </div>`)
    }

    // API请求详情 - 树形结构显示
    // 从 failReason 中解析 [method]/[response]/[error] 部分
    const failReason = props.failReason
    let methodData = null
    let responseData = null
    let errorData = null

    if (failReason) {
        details.push('<div class="device-info-header" style="margin: 12px 0 8px 0; padding: 4px 8px; background: rgba(33, 150, 243, 0.1); border-radius: 4px; font-size: 12px; font-weight: bold; color: red;"> 🔍 失败详情</div>')

        const reasonStr = String(failReason)

        // 解析 [method] 部分 - 处理换行符
        const methodMatch = reasonStr.match(/\[method\]:\s*\n?\s*(\{[\s\S]*?\})(?=\n?\s*\[|$)/)
        if (methodMatch) {
            try {
                methodData = JSON.parse(methodMatch[1])
            } catch (e) {
                console.warn('Failed to parse method data:', e, methodMatch[1])
            }
        }

        // 解析 [response] 部分 - 处理换行符
        const responseMatch = reasonStr.match(/\[response\]:\s*\n?\s*(\{[\s\S]*?\})(?=\n?\s*\[|$)/)
        if (responseMatch) {
            try {
                responseData = JSON.parse(responseMatch[1])
            } catch (e) {
                console.warn('Failed to parse response data:', e, responseMatch[1])
            }
        }

        // 解析 [error] 部分 - 处理换行符，支持JSON和纯文本
        const errorMatch = reasonStr.match(/\[error\]:\s*\n?\s*(.+?)(?=\n?\s*\[|$)/s)
        if (errorMatch) {
            const errorContent = errorMatch[1].trim()
            // 尝试作为JSON解析，如果失败则作为纯文本处理
            try {
                if (errorContent.startsWith('{') && errorContent.endsWith('}')) {
                    errorData = JSON.parse(errorContent)
                } else {
                    // 纯文本错误信息
                    errorData = { message: errorContent }
                }
            } catch (e) {
                console.warn('Failed to parse error data:', e, errorContent)
                errorData = { message: errorContent }
            }
        }
    }

    // [method] 部分
    if (methodData) {
        const treeHtml = generateTreeStructure(methodData, 'method', '📨', methodData)
        if (treeHtml) {
            details.push(treeHtml)
        }
    }

    // [response] 部分（如果有响应数据且没有错误）
    if (responseData && !errorData) {
        const treeHtml = generateTreeStructure(responseData, 'response', '📥', responseData)
        if (treeHtml) {
            details.push(treeHtml)
        }
    }

    // [error] 部分（如果有错误数据）
    if (errorData) {
        const treeHtml = generateTreeStructure(errorData, 'error', '❌', errorData)
        if (treeHtml) {
            details.push(treeHtml)
        }
    }

    // 如果没有API数据，则显示传统格式的args
    if (!methodData && !responseData && !errorData && props.args) {
        const formatted = formatJson(props.args)
        details.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">📨</span>
            <span class="pay-detail-label">args:</span>
            <span class="pay-detail-value">
                <pre style="white-space: pre-wrap; margin: 0;">${encodeHtml(formatted)}</pre>
                <button class="copy-btn" data-copy="${encodeURIComponent(formatted)}" onclick="copyData(this)">复制</button>
            </span>
        </div>`)
    }

    // 分析数据（格式化 JSON）优先 args.analysisData
    // const analysisDataForDisplay = props.args?.analysisData || props.analysisData
    // if (analysisDataForDisplay) {
    //     const formatted = formatJson(analysisDataForDisplay)
    //     details.push(`<div class="pay-detail-item">
    //         <span class="pay-detail-icon">🧭</span>
    //         <span class="pay-detail-label">analysisData:</span>
    //         <span class="pay-detail-value">
    //             <pre style="white-space: pre-wrap; margin: 0;">${encodeHtml(formatted)}</pre>
    //             <button class="copy-btn" data-copy="${encodeURIComponent(formatted)}" onclick="copyData(this)">复制</button>
    //         </span>
    //     </div>`)
    // }

    // 阅读进度
    if (props.readProgress !== undefined) {
        details.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">📊</span>
            <span class="pay-detail-label">阅读进度:</span>
            <span class="pay-detail-value">${props.readProgress}%</span>
        </div>`)
    }

    // 响应信息
    if (props.code !== undefined) {
        const isSuccess = props.code === 200
        details.push(`<div class="pay-detail-item" style="color: ${isSuccess ? '#4caf50' : '#f44336'}">
            <span class="pay-detail-icon">${isSuccess ? '✅' : '❌'}</span>
            <span class="pay-detail-label">响应码:</span>
            <span class="pay-detail-value">${props.code}</span>
        </div>`)
    }

    if (props.latency !== undefined) {
        details.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">⚡</span>
            <span class="pay-detail-label">耗时:</span>
            <span class="pay-detail-value">${(props.latency * 1000).toFixed(2)}ms</span>
        </div>`)
    }

    // TraceId
    if (props.traceId) {
        details.push(`<div class="pay-detail-item">
            <span class="pay-detail-icon">🔗</span>
            <span class="pay-detail-label">TraceId:</span>
            <span class="pay-detail-value" style="font-family: monospace; font-size: 11px;">${props.traceId}</span>
        </div>`)
    }

    return details.length > 0 ? details.join('') : '<div class="no-detail">暂无详细信息</div>'
}


