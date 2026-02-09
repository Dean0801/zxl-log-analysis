/**
 * Grafana 页面 Content Script (ISOLATED world)
 * 负责：接收拦截器传递的日志数据、显示浮动操作按钮、与 background.js 通信
 *
 * 注意：inject-interceptor.js 已通过 manifest.json 的 "world": "MAIN" 直接注入到页面主世界，
 * 不再需要手动注入。拦截器通过 CustomEvent 与此脚本通信。
 */
(function () {
  "use strict";

  // 存储捕获的日志数据
  let capturedLogs = [];
  let captureCount = 0;

  /**
   * 创建浮动操作按钮
   */
  function createFloatingButton() {
    // 避免重复创建
    if (document.getElementById("grafana-log-exporter-btn")) return;

    const container = document.createElement("div");
    container.id = "grafana-log-exporter-btn";
    container.className = "gle-floating-container";
    container.innerHTML = `
      <div class="gle-badge" id="gle-badge">0</div>
      <button class="gle-btn" id="gle-send-btn" title="发送日志到分析工具" disabled>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <polyline points="9 15 12 12 15 15"/>
        </svg>
        <span class="gle-btn-text">发送到日志分析</span>
      </button>
      <button class="gle-clear-btn" id="gle-clear-btn" title="清空捕获的数据">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    document.body.appendChild(container);

    // 绑定事件
    document.getElementById("gle-send-btn").addEventListener("click", sendToAnalysisTool);
    document.getElementById("gle-clear-btn").addEventListener("click", clearCapturedData);
  }

  /**
   * 更新浮动按钮状态
   */
  function updateButtonState() {
    const badge = document.getElementById("gle-badge");
    const sendBtn = document.getElementById("gle-send-btn");
    const clearBtn = document.getElementById("gle-clear-btn");
    const container = document.getElementById("grafana-log-exporter-btn");

    if (!badge || !sendBtn || !container) return;

    const count = capturedLogs.length;
    badge.textContent = count > 999 ? "999+" : String(count);

    if (count > 0) {
      sendBtn.disabled = false;
      container.classList.add("gle-has-data");
      badge.classList.add("gle-badge-active");
      clearBtn.style.display = "flex";
    } else {
      sendBtn.disabled = true;
      container.classList.remove("gle-has-data");
      badge.classList.remove("gle-badge-active");
      clearBtn.style.display = "none";
    }
  }

  /**
   * 发送数据到日志分析工具
   */
  function sendToAnalysisTool() {
    if (capturedLogs.length === 0) return;

    const sendBtn = document.getElementById("gle-send-btn");
    const btnText = sendBtn.querySelector(".gle-btn-text");
    const originalText = btnText.textContent;

    // 显示发送中状态
    sendBtn.disabled = true;
    btnText.textContent = "发送中...";

    // 通过 background.js 中转存储数据并打开分析工具
    chrome.runtime.sendMessage(
      {
        type: "SEND_LOGS_TO_ANALYSIS",
        data: capturedLogs,
      },
      (response) => {
        if (response && response.success) {
          btnText.textContent = "已发送 ✓";
          setTimeout(() => {
            btnText.textContent = originalText;
            sendBtn.disabled = false;
          }, 2000);
        } else {
          btnText.textContent = "发送失败";
          sendBtn.disabled = false;
          setTimeout(() => {
            btnText.textContent = originalText;
          }, 2000);
          console.error("[Grafana Log Exporter] 发送失败:", response?.error);
        }
      }
    );
  }

  /**
   * 清空捕获的数据
   */
  function clearCapturedData() {
    capturedLogs = [];
    captureCount = 0;
    updateButtonState();
    console.log("[Grafana Log Exporter] 已清空捕获的数据");
  }

  /**
   * 监听来自 inject-interceptor.js (MAIN world) 的日志数据事件
   * 两个 world 共享同一个 DOM，所以 CustomEvent 可以跨 world 传递
   */
  function listenForLogData() {
    window.addEventListener("grafana-loki-data", (event) => {
      const detail = event.detail;
      if (!detail || !detail.logs || !Array.isArray(detail.logs)) return;

      // 合并新捕获的日志（去重基于 timestamp + line 的前50字符）
      const existingKeys = new Set(
        capturedLogs.map((l) => l.timestamp + "|" + (l.line || "").substring(0, 50))
      );

      let newCount = 0;
      for (const log of detail.logs) {
        const key = log.timestamp + "|" + (log.line || "").substring(0, 50);
        if (!existingKeys.has(key)) {
          capturedLogs.push(log);
          existingKeys.add(key);
          newCount++;
        }
      }

      captureCount++;
      console.log(
        `[Grafana Log Exporter] 第 ${captureCount} 次捕获: 新增 ${newCount} 条, 总计 ${capturedLogs.length} 条`
      );

      updateButtonState();
    });
  }

  /**
   * 等待 document.body 就绪后创建浮动按钮
   * 在 document_start 阶段 body 可能还不存在
   */
  function waitForBody(callback) {
    if (document.body) {
      callback();
      return;
    }
    const observer = new MutationObserver(() => {
      if (document.body) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(document.documentElement, { childList: true });
  }

  // 初始化
  function init() {
    listenForLogData();
    waitForBody(() => {
      createFloatingButton();
    });
    console.log("[Grafana Log Exporter] Content Script 已加载 (ISOLATED world)");
  }

  init();
})();
