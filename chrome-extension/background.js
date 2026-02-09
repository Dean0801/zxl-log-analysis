/**
 * Grafana Log Exporter - Service Worker (Background)
 * 负责：接收 Content Script 的日志数据，存储到 chrome.storage.local，
 * 并打开日志分析工具标签页。
 */

const ANALYSIS_TOOL_URL = "https://zxl-log-analysis.vercel.app/";
const STORAGE_KEY = "grafana_log_exporter_data";

/**
 * 监听来自 Content Script 的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SEND_LOGS_TO_ANALYSIS") {
    handleSendLogs(message.data)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));

    // 返回 true 表示异步 sendResponse
    return true;
  }
});

/**
 * 处理发送日志到分析工具
 */
async function handleSendLogs(logs) {
  if (!logs || !Array.isArray(logs) || logs.length === 0) {
    throw new Error("没有可发送的日志数据");
  }

  // 存储数据到 chrome.storage.local
  await chrome.storage.local.set({
    [STORAGE_KEY]: {
      logs: logs,
      timestamp: Date.now(),
      count: logs.length,
    },
  });

  console.log(
    `[Grafana Log Exporter] 已存储 ${logs.length} 条日志到 storage`
  );

  // 检查是否已有分析工具标签页打开
  const tabs = await chrome.tabs.query({ url: ANALYSIS_TOOL_URL + "*" });

  if (tabs.length > 0) {
    // 已有标签页，刷新并激活
    const tab = tabs[0];
    await chrome.tabs.update(tab.id, {
      active: true,
      url: ANALYSIS_TOOL_URL + "?source=extension&t=" + Date.now(),
    });
  } else {
    // 创建新标签页
    await chrome.tabs.create({
      url: ANALYSIS_TOOL_URL + "?source=extension&t=" + Date.now(),
      active: true,
    });
  }
}
