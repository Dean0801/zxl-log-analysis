/**
 * Grafana Loki API 拦截器
 * 通过 manifest.json 的 "world": "MAIN" + "document_start" 注入。
 *
 * 核心策略：拦截 Response.prototype.json()
 * 因为 Grafana 在模块初始化时缓存了 fetch 引用，直接 patch window.fetch 无效。
 * 但无论使用哪个 fetch 引用，最终读取响应体都必须经过 Response.prototype.json()，
 * 这个拦截点无法被绕过。
 */
(function () {
  "use strict";

  if (window.__grafanaLogInterceptorInstalled) return;
  window.__grafanaLogInterceptorInstalled = true;

  const TAG = "[Grafana Log Exporter]";

  /**
   * 判断 URL 是否为 Loki 查询相关端点
   */
  function isLokiQueryURL(url) {
    if (typeof url !== "string") return false;
    return (
      url.includes("/api/ds/query") ||
      url.includes("/loki/api/v1/query_range") ||
      url.includes("/loki/api/v1/query")
    );
  }

  // ========== 数据提取 ==========

  /**
   * 从 Grafana ds/query 格式中提取日志
   */
  function extractFromDsQuery(json) {
    const logs = [];
    const results = json.results;
    if (!results || typeof results !== "object") return logs;

    for (const refId of Object.keys(results)) {
      const result = results[refId];
      if (!result || !result.frames) continue;

      for (const frame of result.frames) {
        if (!frame.data || !frame.data.values) continue;

        const fields = frame.schema?.fields || [];
        const values = frame.data.values;

        let lineIdx = -1;
        let tsIdx = -1;

        // 通过字段名查找
        for (let i = 0; i < fields.length; i++) {
          const name = (fields[i].name || "").toLowerCase();
          if (name === "body" || name === "line") lineIdx = i;
          else if (name === "tsns" || name === "timestamp") tsIdx = i;
        }

        // 通过字段类型查找
        if (lineIdx === -1 || tsIdx === -1) {
          for (let i = 0; i < fields.length; i++) {
            const ft = (fields[i].type || "").toLowerCase();
            if (ft === "string" && lineIdx === -1 && i > 0) lineIdx = i;
            if ((ft === "time" || fields[i].name === "Time") && tsIdx === -1) tsIdx = i;
          }
        }

        // 按常见位置兜底
        if (lineIdx === -1 && values.length >= 3) lineIdx = 2;
        if (tsIdx === -1 && values.length >= 5) tsIdx = 4;
        if (lineIdx === -1) continue;

        const lines = values[lineIdx] || [];
        const timestamps = tsIdx >= 0 ? values[tsIdx] || [] : [];

        for (let i = 0; i < lines.length; i++) {
          logs.push({
            line: lines[i],
            timestamp: timestamps[i] ? String(timestamps[i]) : "",
          });
        }
      }
    }
    return logs;
  }

  /**
   * 从 Loki 原生格式中提取日志
   */
  function extractFromLokiNative(json) {
    const logs = [];
    const data = json.data;
    if (!data || !data.result) return logs;

    for (const stream of data.result) {
      if (!stream.values) continue;
      for (const [timestamp, line] of stream.values) {
        logs.push({ line, timestamp: String(timestamp) });
      }
    }
    return logs;
  }

  /**
   * 处理响应数据，提取日志并派发事件
   */
  function processResponse(json, url) {
    let logs = [];

    if (json.results) {
      logs = extractFromDsQuery(json);
    }
    if (logs.length === 0 && json.data && json.data.result) {
      logs = extractFromLokiNative(json);
    }

    if (logs.length > 0) {
      console.log(`${TAG} 捕获到 ${logs.length} 条日志 (from: ${url})`);
      window.dispatchEvent(
        new CustomEvent("grafana-loki-data", {
          detail: { logs, url, timestamp: Date.now() },
        })
      );
    }
  }

  // ========== 核心：拦截 Response.prototype.json() ==========

  const originalResponseJson = Response.prototype.json;

  Response.prototype.json = function () {
    const responseUrl = this.url || "";
    const isTarget = isLokiQueryURL(responseUrl);

    // 调用原始 .json()
    const promise = originalResponseJson.apply(this, arguments);

    if (isTarget) {
      console.log(`${TAG} 拦截到 Response.json() -> ${responseUrl.substring(0, 120)}`);
      // 观察解析后的 JSON 数据（不影响原始 promise 的消费者）
      promise.then((json) => {
        try {
          processResponse(json, responseUrl);
        } catch (e) {
          console.error(`${TAG} 处理响应数据失败:`, e);
        }
      });
    }

    return promise;
  };

  // 同时拦截 Response.prototype.text()，防止有代码用 text() + JSON.parse()
  const originalResponseText = Response.prototype.text;

  Response.prototype.text = function () {
    const responseUrl = this.url || "";
    const isTarget = isLokiQueryURL(responseUrl);

    const promise = originalResponseText.apply(this, arguments);

    if (isTarget) {
      promise.then((text) => {
        try {
          const json = JSON.parse(text);
          processResponse(json, responseUrl);
        } catch (e) {
          // 非 JSON，忽略
        }
      });
    }

    return promise;
  };

  console.log(`${TAG} Response 拦截器已安装 (Response.prototype.json/text)`);
})();
