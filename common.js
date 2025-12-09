/**
 * 公共工具函数和配置
 */

// 分类样式映射
export const CATEGORY_STYLES = {
    auto: 'event-auto',
    custom: 'event-custom',
    pay: 'event-pay',
    channel: 'event-channel',
    read: 'event-read',
    search: 'event-search',
    ad: 'event-ad',
    api: 'event-api',
    system: 'event-system',
}

// 分类名称映射
export const CATEGORY_NAMES = {
    auto: '自动采集',
    custom: '自定义',
    pay: '支付相关',
    channel: '渠道相关',
    read: '阅读相关',
    search: '搜索相关',
    ad: '广告相关',
    api: 'API请求',
    system: '系统事件',
}

// 工具函数：格式化时间（显示到毫秒）
export function formatTimeWithMs(date) {
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
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 工具函数：防抖
export function debounce(func, wait) {
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

// 格式化属性显示
export function formatProperties(props) {
    if (!props || Object.keys(props).length === 0) return '-'
    try {
        return JSON.stringify(props, null, 2)
    } catch (e) {
        return String(props)
    }
}

// 获取属性数量
export function getPropertiesCount(props) {
    if (!props || Object.keys(props).length === 0) return '无属性'
    const count = Object.keys(props).length
    return `${count} 个属性`
}

