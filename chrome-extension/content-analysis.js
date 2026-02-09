/**
 * 日志分析工具页面 Content Script
 * 负责：检测 URL 参数，从 chrome.storage.local 读取日志数据，
 * 注入到分析工具页面触发自动导入。
 */
(function () {
  "use strict";

  const STORAGE_KEY = "grafana_log_exporter_data";

  /**
   * 检查是否从插件跳转而来
   */
  function isFromExtension() {
    const params = new URLSearchParams(window.location.search);
    return params.get("source") === "extension";
  }

  /**
   * 从 chrome.storage.local 读取日志数据并注入到页面
   */
  async function loadExtensionData() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      const stored = result[STORAGE_KEY];

      if (!stored || !stored.logs || stored.logs.length === 0) {
        console.log("[Grafana Log Exporter] storage 中没有日志数据");
        return;
      }

      // 检查数据是否过期（超过 5 分钟的数据视为过期）
      const age = Date.now() - (stored.timestamp || 0);
      if (age > 5 * 60 * 1000) {
        console.log("[Grafana Log Exporter] 数据已过期，清理");
        await chrome.storage.local.remove(STORAGE_KEY);
        return;
      }

      console.log(
        `[Grafana Log Exporter] 从 storage 读取到 ${stored.logs.length} 条日志`
      );

      // 等待页面完全加载
      await waitForPageReady();

      // 向页面注入数据
      injectData(stored.logs);

      // 清理 storage 中的临时数据
      await chrome.storage.local.remove(STORAGE_KEY);
      console.log("[Grafana Log Exporter] 已清理 storage 中的临时数据");

      // 清理 URL 参数（不刷新页面）
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    } catch (error) {
      console.error("[Grafana Log Exporter] 加载数据失败:", error);
    }
  }

  /**
   * 等待页面关键元素就绪
   */
  function waitForPageReady() {
    return new Promise((resolve) => {
      // 检查分析工具的关键元素是否已就绪
      function check() {
        const tableBody = document.getElementById("tableBody");
        const uploadArea = document.getElementById("uploadArea");
        if (tableBody || uploadArea) {
          resolve();
        } else {
          setTimeout(check, 200);
        }
      }

      if (document.readyState === "complete") {
        // 多等 500ms 确保 JS 初始化完毕
        setTimeout(check, 500);
      } else {
        window.addEventListener("load", () => setTimeout(check, 500));
      }
    });
  }

  /**
   * 向页面注入数据，触发分析工具的导入逻辑
   */
  function injectData(logs) {
    // 通过 CustomEvent 传递数据给页面的 JS
    // 页面的 miniprogram-analysis.js 需要监听此事件
    const script = document.createElement("script");
    script.textContent = `
      (function() {
        try {
          var data = ${JSON.stringify(logs)};
          document.dispatchEvent(new CustomEvent('extension-log-data', {
            detail: data
          }));
          console.log('[Grafana Log Exporter] 已注入 ' + data.length + ' 条日志数据到页面');
        } catch(e) {
          console.error('[Grafana Log Exporter] 注入数据失败:', e);
        }
      })();
    `;
    document.documentElement.appendChild(script);
    script.remove();
  }

  // 入口：仅当从插件跳转时才加载数据
  if (isFromExtension()) {
    console.log("[Grafana Log Exporter] 检测到从插件跳转，准备加载数据...");
    loadExtensionData();
  }
})();
