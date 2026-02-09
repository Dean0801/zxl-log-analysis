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
} from "./common.js";

import {
  MINIPROGRAM_EVENT_MAP,
  EVENT_NAME_MAP,
  parseMiniprogramData,
  getMiniprogramEventDetail,
} from "./miniprogram-parser.js";

// 全局变量
let allData = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 50;
let sortOrder = "calibratedTime"; // 默认上报时间排序
let sessionIdColorMap = new Map(); // sessionId 到颜色索引的映射
let nextColorIndex = 0; // 下一个要分配的颜色索引

// DOM 元素（延迟初始化）
let uploadArea, fileInput, fileInfo, resultSection, tableBody;
let eventFilter,
  categoryFilter,
  levelFilter,
  searchInput,
  pagination,
  pageSizeSelect;
let sortOrderSelect, uploadHint;

// 复制工具
window.copyData = function (btn) {
  try {
    const txt = decodeURIComponent(btn?.dataset?.copy || "");
    navigator.clipboard?.writeText(txt);
  } catch (e) {
    console.error("复制失败", e);
  }
};

// 初始化函数
function init() {
  // 获取DOM元素
  uploadArea = document.getElementById("uploadArea");
  fileInput = document.getElementById("fileInput");
  fileInfo = document.getElementById("fileInfo");
  resultSection = document.getElementById("resultSection");
  tableBody = document.getElementById("tableBody");
  eventFilter = document.getElementById("eventFilter");
  categoryFilter = document.getElementById("categoryFilter");
  searchInput = document.getElementById("searchInput");
  levelFilter = document.getElementById("levelFilter");
  sortOrderSelect = document.getElementById("sortOrder");
  pagination = document.getElementById("pagination");
  pageSizeSelect = document.getElementById("pageSizeSelect");
  uploadHint = document.getElementById("uploadHint");

  // 检查必要的DOM元素是否存在
  if (!uploadArea || !fileInput || !fileInfo) {
    console.error("必要的DOM元素未找到，请检查HTML结构");
    return;
  }

  uploadArea.addEventListener("dragover", handleDragOver);
  uploadArea.addEventListener("dragleave", handleDragLeave);
  uploadArea.addEventListener("drop", handleDrop);
  fileInput.addEventListener("change", handleFileSelect);

  if (eventFilter) eventFilter.addEventListener("change", applyFilters);
  if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
  if (searchInput)
    searchInput.addEventListener("input", debounce(applyFilters, 300));
  if (pageSizeSelect)
    pageSizeSelect.addEventListener("change", handlePageSizeChange);
  if (levelFilter) levelFilter.addEventListener("change", applyFilters);
  if (sortOrderSelect)
    sortOrderSelect.addEventListener("change", handleSortOrderChange);

  // 初始化分类筛选器
  updateCategoryFilter();

  // 设置文件输入类型（小程序专用）
  if (fileInput && uploadHint) {
    fileInput.accept = ".json";
    uploadHint.textContent = "支持 .json 格式 (Grafana 导出)";
  }

  // 显示level筛选器和排序选择器（小程序专用）
  if (levelFilter) {
    levelFilter.style.display = "inline-block";
  }
  if (sortOrderSelect) {
    sortOrderSelect.style.display = "inline-block";
    sortOrderSelect.value = sortOrder; // 设置默认值
  }

  // 监听来自浏览器插件的日志数据（通过 postMessage，兼容 CSP 限制）
  window.addEventListener("message", (event) => {
    if (
      event.data &&
      event.data.type === "grafana-log-exporter-data" &&
      Array.isArray(event.data.logs)
    ) {
      console.log(
        `📦 收到浏览器插件推送的 ${event.data.logs.length} 条日志数据`
      );
      processJSONData(JSON.stringify(event.data.logs), "浏览器插件导入");
    }
  });

  console.log("✅ 日志分析工具初始化完成");
}

// 等待DOM加载完成
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  // DOM已经加载完成
  init();
}

// 更新分类筛选器（小程序专用）
function updateCategoryFilter() {
  if (!categoryFilter) return;
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
    `;
}

// 排序顺序变更处理
function handleSortOrderChange(e) {
  sortOrder = e.target.value;
  // 确保在排序切换时重置到第1页并正确更新
  currentPage = 1;
  applyFilters();
}

// 分页大小变更处理
function handlePageSizeChange(e) {
  pageSize = parseInt(e.target.value, 10);
  currentPage = 1;
  renderTable();
  renderPagination();
}

// 拖拽处理
function handleDragOver(e) {
  e.preventDefault();
  if (uploadArea) uploadArea.classList.add("dragover");
}

function handleDragLeave(e) {
  e.preventDefault();
  if (uploadArea) uploadArea.classList.remove("dragover");
}

function handleDrop(e) {
  e.preventDefault();
  if (uploadArea) uploadArea.classList.remove("dragover");
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

// 文件选择处理
function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

// 处理文件（小程序专用）
function processFile(file) {
  processJSONFile(file);
}

// 处理 JSON 文件 (小程序日志)
function processJSONFile(file) {
  if (!fileInfo) {
    console.error("fileInfo元素未初始化");
    return;
  }

  if (!file.name.match(/\.json$/i)) {
    alert("请上传 JSON 文件 (.json)");
    return;
  }

  fileInfo.style.display = "block";
  fileInfo.style.background = "#e3f2fd";
  fileInfo.style.color = "#1565c0";
  fileInfo.textContent = `正在解析文件: ${file.name} (${formatFileSize(
    file.size
  )})`;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const jsonData = JSON.parse(e.target.result);

      fileInfo.innerHTML = `✅ 文件解析成功: <strong>${file.name}</strong> | 共 <strong>${jsonData.length}</strong> 条记录`;

      // 重置排序为默认值（正序）
      sortOrder = "asc";
      if (sortOrderSelect) {
        sortOrderSelect.value = "asc";
      }

      // 重置颜色映射，确保新文件的 sessionId 从第一个颜色开始分配
      sessionIdColorMap.clear();
      nextColorIndex = 0;

      allData = parseMiniprogramData(jsonData);
      updateEventFilter();
      applyFilters();
      resultSection.style.display = "block";
    } catch (error) {
      console.error("解析错误:", error);
      fileInfo.style.background = "#ffebee";
      fileInfo.style.color = "#c62828";
      fileInfo.textContent = `❌ 文件解析失败: ${error.message}`;
    }
  };
  reader.readAsText(file);
}

// 更新事件筛选器
function updateEventFilter() {
  if (!eventFilter) return;
  const eventTypes = [...new Set(allData.map((d) => d.event))].sort();
  eventFilter.innerHTML = '<option value="">全部事件</option>';

  eventTypes.forEach((event) => {
    const info = MINIPROGRAM_EVENT_MAP[event] ||
      EVENT_NAME_MAP[event] || { desc: event.split("/").pop() || "未知事件" };
    const option = document.createElement("option");
    option.value = event;
    const fullText = `${info.desc || event}`;
    // 限制选项文本长度，避免下拉框过宽
    const maxLength = 40;
    const displayText =
      fullText.length > maxLength
        ? fullText.substring(0, maxLength) + "..."
        : fullText;
    option.textContent = displayText;
    option.title = fullText; // 鼠标悬停时显示完整文本
    eventFilter.appendChild(option);
  });
}

// 应用筛选
function applyFilters() {
  if (!eventFilter || !categoryFilter || !searchInput) return;

  const eventValue = eventFilter.value;
  const categoryValue = categoryFilter.value;
  const searchValue = searchInput.value.toLowerCase();
  const levelValue = levelFilter ? levelFilter.value : "";

  filteredData = allData.filter((item) => {
    // 事件筛选
    if (eventValue && item.event !== eventValue) return false;

    // 分类筛选
    if (categoryValue && item.category !== categoryValue) return false;

    // level 筛选（仅小程序）
    if (levelValue) {
      const itemLevel =
        (item.properties && item.properties.level) ||
        (item.rawData && item.rawData.level);
      if (itemLevel !== levelValue) return false;
    }

    // 搜索筛选
    if (searchValue) {
      const searchStr = JSON.stringify(item)
        .toLowerCase()
        .replace(/[\n\r\s\\]+/g, "");
      if (!searchStr.includes(searchValue)) return false;
    }

    return true;
  });

  // 应用排序
  filteredData.sort((a, b) => {
    if (sortOrder === "calibratedTime") {
      // 按上报时间排序（正序）
      const aTime = a.rawData?.analysisData?.calibratedTime || a.timestamp;
      const bTime = b.rawData?.analysisData?.calibratedTime || b.timestamp;

      // 如果两个都有 calibratedTime，按时间排序
      if (aTime && bTime) {
        const aTimeNum =
          typeof aTime === "number" ? aTime : new Date(aTime).getTime();
        const bTimeNum =
          typeof bTime === "number" ? bTime : new Date(bTime).getTime();
        if (!isNaN(aTimeNum) && !isNaN(bTimeNum)) {
          return aTimeNum - bTimeNum;
        }
      }

      // 如果只有一个有 calibratedTime，有时间的排在前面
      if (aTime && !bTime) return -1;
      if (!aTime && bTime) return 1;

      // 如果都没有 calibratedTime，按 index 排序作为降级
      const aIndex = a.index || 0;
      const bIndex = b.index || 0;
      return aIndex - bIndex;
    } else {
      // 按时间排序（正序或倒序）
      const aTimestamp = a.timestamp || 0;
      const bTimestamp = b.timestamp || 0;
      if (sortOrder === "asc") {
        // 正序：时间早的在前面
        return aTimestamp - bTimestamp;
      } else {
        // 倒序：时间晚的在前面
        return bTimestamp - aTimestamp;
      }
    }
  });

  // 确保重置到第1页（防止从非第1页切换排序时状态不一致）
  currentPage = 1;

  // 确保表格和分页控件都正确更新
  renderTable();
  renderPagination();

  // 滚动到表格顶部，确保用户看到更新后的内容
  const tableContainer = document.querySelector(".table-container");
  if (tableContainer) {
    tableContainer.scrollTop = 0;
  }
}

// 检查是否需要显示tooltip（小程序专用）
function hasDetailTooltip(item) {
  return (
    item.hasTooltip ||
    item.category === "ad" ||
    item.category === "pay" ||
    item.level === "ERROR"
  );
}

// 获取tooltip图标（小程序专用）
function getTooltipIcon(item) {
  return item.icon || "📋";
}

// 获取事件详情（小程序专用）
function getEventDetail(item) {
  return getMiniprogramEventDetail(item);
}

// 根据 sessionId 获取颜色
function getColorBySessionId(sessionId) {
  const HEX_COLOR_LIST = [
    "#67C23A", // 绿色
    "#E6A23C", // 橙色
    "#F56C6C", // 红色
    "#909399", // 灰色
    "#409EFF", // 蓝色
    "#9C27B0", // 紫色
  ];

  if (!sessionId) {
    return null;
  }

  // 如果该 sessionId 已经分配过颜色，直接返回
  if (sessionIdColorMap.has(sessionId)) {
    const colorIndex = sessionIdColorMap.get(sessionId);
    return HEX_COLOR_LIST[colorIndex];
  }

  // 为新 sessionId 分配颜色（按顺序循环分配）
  const colorIndex = nextColorIndex % HEX_COLOR_LIST.length;
  sessionIdColorMap.set(sessionId, colorIndex);
  nextColorIndex++;

  return HEX_COLOR_LIST[colorIndex];
}

// 将十六进制颜色转换为带透明度的 rgba
function hexToRgba(hex, alpha = 0.2) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 格式化 calibratedTime 为 YYYY/MM/DD HH:mm:ss.ms
function formatCalibratedTime(timestamp) {
  if (!timestamp) return "";

  const date = new Date(
    typeof timestamp === "number" ? timestamp : Number(timestamp)
  );
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ms = String(date.getMilliseconds()).padStart(3, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}.${ms}`;
}

// 渲染表格
function renderTable() {
  if (!tableBody) return;

  const escapeHtml = (str = "") =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageData = filteredData.slice(start, end);

  tableBody.innerHTML = pageData
    .map((item) => {
      const isPay = item.category === "pay";
      const isAd = item.category === "ad";
      const isError = item.level === "ERROR";
      const rowClass = isPay
        ? "pay-row"
        : isAd
        ? "ad-row"
        : isError
        ? "error-row"
        : "";

      // code / reason 小徽标（仅小程序）
      let codeReasonBadges = "";
      const codeVal = item.properties?.code;
      const reasonVal = item.properties?.reason;
      if (codeVal !== undefined) {
        codeReasonBadges += `<span class="mini-badge code-badge">Code ${escapeHtml(
          codeVal
        )}</span>`;
      }
      if (reasonVal) {
        const reasonText = escapeHtml(String(reasonVal));
        const shortReason =
          reasonText.length > 60 ? reasonText.slice(0, 60) + "..." : reasonText;
        codeReasonBadges += `<span class="mini-badge reason-badge" title="${reasonText}">${shortReason}</span>`;
      }

      // 生成错误状态码和消息标签
      let errorBadges = "";

      if (
        item.rawData?.analysisData?.index ||
        item.rawData?.analysisData?.index === 0
      ) {
        // 埋点顺序标签
        const sessionId = item.rawData?.analysisData?.sessionId;
        const color = getColorBySessionId(sessionId);

        let badgeStyle = "";
        let badgeTitle = "";
        if (color) {
          // 字体颜色直接使用，背景和边框使用透明度
          const bgColor = hexToRgba(color, 0.2); // 背景透明度 20%
          const borderColor = hexToRgba(color, 0.5); // 边框透明度 50%
          badgeStyle = `style="background: ${bgColor}; border-color: ${borderColor}; color: ${color};"`;
        }

        // 如果有 sessionId，添加 title 属性用于鼠标悬浮显示
        if (sessionId) {
          badgeTitle = `title="${escapeHtml(String(sessionId))}"`;
        }

        errorBadges += `<span class="error-index-badge" ${badgeStyle} ${badgeTitle}>${item.rawData?.analysisData?.index}</span>`;
      }

      if (item.failReason) {
        // 埋点失败原因标签
        errorBadges += `<span class="error-code-badge">${item.failReason}</span>`;
      }

      if (
        item.responseCode &&
        item.responseCode >= 400 &&
        item.responseCode < 600
      ) {
        // 状态码标签
        errorBadges += `<span class="error-code-badge">${item.responseCode}</span>`;
        // 消息标签
        if (item.responseMessage) {
          const messageText = escapeHtml(String(item.responseMessage));
          const shortMessage =
            messageText.length > 30
              ? messageText.slice(0, 30) + "..."
              : messageText;
          errorBadges += `<span class="error-message-badge" title="${messageText}">${shortMessage}</span>`;
        }
      }

      // 如果有error信息，也显示标签
      if (item.errorMessage) {
        const errorText = escapeHtml(String(item.errorMessage));
        errorBadges += `<span class="error-message-badge" title="${errorText}">${errorText}</span>`;
      }

      // 简化的事件描述显示，移除hover tooltip
      const descContent = `<div><span style="margin-right: 6px;">${
        item.icon || ""
      }</span>${item.desc}</div><div class="event-desc">${item.detail}</div>${
        errorBadges
          ? `<div style="margin-top: 4px; display: flex; gap: 6px; flex-wrap: wrap;">${errorBadges}</div>`
          : ""
      }`;

      // 简化的事件名称显示，移除hover tooltip
      const eventNameContent =
        isError && item.failReason
          ? `<div class="event-name-line">
                        <span class="event-badge event-error">${
                          item.desc || item.event
                        }</span>
                        ${codeReasonBadges}
                   </div>`
          : `<div class="event-name-line">
                        <span class="event-badge ${
                          CATEGORY_STYLES[item.category] || "event-custom"
                        }">${item.desc || item.event}</span>
                        ${codeReasonBadges}
                   </div>`;

      const rawJson = escapeHtml(JSON.stringify(item.rawData || {}, null, 2));
      const rawCopy = encodeURIComponent(
        JSON.stringify(item.rawData || {}, null, 2)
      );

      // 格式化 calibratedTime 显示
      const calibratedTime = item.rawData?.analysisData?.calibratedTime;
      const formattedCalibratedTime = formatCalibratedTime(calibratedTime);
      const timeCellContent = formattedCalibratedTime
        ? `<div>${
            item.time || "-"
          }</div><div style="font-size: 13px; color: #67c23a; margin-top: 2px;">${formattedCalibratedTime}</div>`
        : item.time || "-";

      return `
        <tr class="${rowClass}">
            <td class="time-cell">${timeCellContent}</td>
            <td class="${isError ? "event-error" : ""}">
                ${eventNameContent}
            </td>
            <td class="desc-cell">${descContent}</td>
            <td>
                <span class="event-badge ${
                  CATEGORY_STYLES[item.category] || "event-custom"
                }">
                    ${CATEGORY_NAMES[item.category] || "其他"}
                </span>
            </td>
            <td class="page-cell">${item.pagePath || "-"}</td>
            <td>
                <div class="operation-buttons">
                    <button class="detail-btn" onclick="showDetailModal(${JSON.stringify(
                      item
                    ).replace(/"/g, "&quot;")})">查看详情</button>
                    <button class="copy-btn" data-copy="${rawCopy}" onclick="copyData(this)">复制</button>
                </div>
            </td>
        </tr>
    `;
    })
    .join("");
}

// 渲染分页
function renderPagination() {
  if (!pagination) return;

  const totalPages = Math.ceil(filteredData.length / pageSize);

  if (totalPages <= 1) {
    pagination.innerHTML = `<span class="page-info">共 ${filteredData.length} 条记录</span>`;
    return;
  }

  pagination.innerHTML = `
        <button onclick="goToPage(1)" ${
          currentPage === 1 ? "disabled" : ""
        }>首页</button>
        <button onclick="goToPage(${currentPage - 1})" ${
    currentPage === 1 ? "disabled" : ""
  }>上一页</button>
        <span class="page-info">第 ${currentPage} / ${totalPages} 页 (共 ${
    filteredData.length
  } 条)</span>
        <button onclick="goToPage(${currentPage + 1})" ${
    currentPage === totalPages ? "disabled" : ""
  }>下一页</button>
        <button onclick="goToPage(${totalPages})" ${
    currentPage === totalPages ? "disabled" : ""
  }>末页</button>
    `;
}

// 跳转到指定页
window.goToPage = function (page) {
  const totalPages = Math.ceil(filteredData.length / pageSize);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
  renderPagination();
  document.querySelector(".table-container").scrollTop = 0;
};

// 显示导入模态框
window.showImportModal = function () {
  const importModal = document.getElementById("importModal");
  if (importModal) {
    importModal.style.display = "block";
    // 初始化导入上传区域的事件监听
    initImportUploadArea();

    // 设置关闭按钮事件
    const closeBtn = importModal.querySelector(".detail-modal-close");
    if (closeBtn) {
      closeBtn.onclick = function () {
        hideImportModal();
      };
    }

    // 点击背景关闭
    importModal.onclick = function (event) {
      if (event.target === importModal) {
        hideImportModal();
      }
    };
  }
};

// 隐藏导入模态框
window.hideImportModal = function () {
  const importModal = document.getElementById("importModal");
  if (importModal) {
    importModal.style.display = "none";
    // 重置导入文件信息
    const importFileInfo = document.getElementById("importFileInfo");
    if (importFileInfo) {
      importFileInfo.style.display = "none";
      importFileInfo.textContent = "";
    }
    // 重置文件输入
    const importFileInput = document.getElementById("importFileInput");
    if (importFileInput) {
      importFileInput.value = "";
    }
  }
};

// 初始化导入上传区域
function initImportUploadArea() {
  const importUploadArea = document.getElementById("importUploadArea");
  const importFileInput = document.getElementById("importFileInput");

  if (!importUploadArea || !importFileInput) return;

  // 检查是否已经绑定过事件监听器（避免重复绑定）
  if (importUploadArea.dataset.listenersBound === "true") {
    return;
  }

  // 添加拖拽事件
  importUploadArea.addEventListener("dragover", handleImportDragOver);
  importUploadArea.addEventListener("dragleave", handleImportDragLeave);
  importUploadArea.addEventListener("drop", handleImportDrop);
  importFileInput.addEventListener("change", handleImportFileSelect);

  // 标记已绑定事件监听器
  importUploadArea.dataset.listenersBound = "true";
}

// 导入拖拽处理
function handleImportDragOver(e) {
  e.preventDefault();
  const importUploadArea = document.getElementById("importUploadArea");
  if (importUploadArea) importUploadArea.classList.add("dragover");
}

function handleImportDragLeave(e) {
  e.preventDefault();
  const importUploadArea = document.getElementById("importUploadArea");
  if (importUploadArea) importUploadArea.classList.remove("dragover");
}

function handleImportDrop(e) {
  e.preventDefault();
  const importUploadArea = document.getElementById("importUploadArea");
  if (importUploadArea) importUploadArea.classList.remove("dragover");
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processImportFile(files[0]);
  }
}

// 导入文件选择处理
function handleImportFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    processImportFile(files[0]);
  }
}

// 处理导入文件
function processImportFile(file) {
  const importFileInfo = document.getElementById("importFileInfo");

  if (!importFileInfo) {
    console.error("importFileInfo元素未初始化");
    return;
  }

  if (!file.name.match(/\.json$/i)) {
    importFileInfo.style.display = "block";
    importFileInfo.style.background = "#ffebee";
    importFileInfo.style.color = "#c62828";
    importFileInfo.textContent = "❌ 请上传 JSON 文件 (.json)";
    return;
  }

  importFileInfo.style.display = "block";
  importFileInfo.style.background = "#e3f2fd";
  importFileInfo.style.color = "#1565c0";
  importFileInfo.textContent = `正在解析文件: ${file.name} (${formatFileSize(
    file.size
  )})`;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const jsonData = JSON.parse(e.target.result);

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        importFileInfo.style.background = "#ffebee";
        importFileInfo.style.color = "#c62828";
        importFileInfo.textContent =
          "❌ 文件为空或格式不正确，请确保文件包含有效的日志数据";
        return;
      }

      // 解析新数据
      const newData = parseMiniprogramData(jsonData);

      if (newData.length === 0) {
        importFileInfo.style.background = "#ffebee";
        importFileInfo.style.color = "#c62828";
        importFileInfo.textContent = "❌ 文件中没有有效的日志记录";
        return;
      }

      // 合并数据：始终合并，保留现有数据
      const existingDataCount = allData.length;

      // 无论是否有现有数据，都进行合并操作
      // 如果有现有数据，追加新数据；如果没有，则新数据就是全部数据
      if (existingDataCount > 0) {
        // 获取现有数据的最大序号
        const maxIndex = Math.max(...allData.map((item) => item.index || 0), 0);

        // 更新新数据的序号，从最大序号+1开始
        newData.forEach((item, idx) => {
          item.index = maxIndex + idx + 1;
        });

        // 合并数据，保留现有 sessionId 颜色映射
        allData = [...allData, ...newData];
        importFileInfo.innerHTML = `✅ 文件解析成功: <strong>${file.name}</strong> | 导入 <strong>${newData.length}</strong> 条记录 | 原有 <strong>${existingDataCount}</strong> 条 | 总计 <strong>${allData.length}</strong> 条记录`;
      } else {
        // 首次导入（没有现有数据），重置颜色映射
        sessionIdColorMap.clear();
        nextColorIndex = 0;
        allData = [...newData]; // 使用展开运算符保持一致性
        importFileInfo.innerHTML = `✅ 文件解析成功: <strong>${file.name}</strong> | 共 <strong>${allData.length}</strong> 条记录`;
      }

      // 更新事件筛选器
      updateEventFilter();

      // 重置到第一页
      currentPage = 1;

      // 重新应用筛选
      applyFilters();

      // 显示结果区域（如果之前隐藏）
      if (resultSection) {
        resultSection.style.display = "block";
      }

      // 延迟关闭模态框，让用户看到成功消息
      setTimeout(() => {
        hideImportModal();
      }, 1500);
    } catch (error) {
      console.error("解析错误:", error);
      importFileInfo.style.background = "#ffebee";
      importFileInfo.style.color = "#c62828";
      importFileInfo.textContent = `❌ 文件解析失败: ${error.message}`;
    }
  };
  reader.readAsText(file);
}

// 通用的 JSON 数据处理函数（用于剪贴板和文本导入）
function processJSONData(jsonText, sourceName = "数据") {
  const fileInfo = document.getElementById("fileInfo");

  if (!fileInfo) {
    console.error("fileInfo元素未初始化");
    return false;
  }

  // 检查文本是否为空
  if (!jsonText || jsonText.trim() === "") {
    fileInfo.style.display = "block";
    fileInfo.style.background = "#ffebee";
    fileInfo.style.color = "#c62828";
    fileInfo.textContent = `❌ ${sourceName}为空，请先输入 JSON 数据`;
    return false;
  }

  // 验证并解析 JSON
  let jsonData;
  try {
    jsonData = JSON.parse(jsonText);
  } catch (parseError) {
    fileInfo.style.display = "block";
    fileInfo.style.background = "#ffebee";
    fileInfo.style.color = "#c62828";
    fileInfo.textContent = `❌ ${sourceName}不是有效的 JSON 格式: ${parseError.message}`;
    return false;
  }

  // 如果解析结果是单个对象，将其包装成数组
  if (!Array.isArray(jsonData)) {
    if (typeof jsonData === "object" && jsonData !== null) {
      jsonData = [jsonData];
    } else {
      fileInfo.style.display = "block";
      fileInfo.style.background = "#ffebee";
      fileInfo.style.color = "#c62828";
      fileInfo.textContent = `❌ ${sourceName}格式不正确，请确保是 JSON 对象或数组`;
      return false;
    }
  }

  // 验证数组不为空
  if (jsonData.length === 0) {
    fileInfo.style.display = "block";
    fileInfo.style.background = "#ffebee";
    fileInfo.style.color = "#c62828";
    fileInfo.textContent = `❌ ${sourceName}为空数组，请确保包含日志数据`;
    return false;
  }

  // 解析新数据
  const newData = parseMiniprogramData(jsonData);

  if (newData.length === 0) {
    fileInfo.style.display = "block";
    fileInfo.style.background = "#ffebee";
    fileInfo.style.color = "#c62828";
    fileInfo.textContent = `❌ ${sourceName}中没有有效的日志记录`;
    return false;
  }

  // 合并数据：始终合并，保留现有数据
  const existingDataCount = allData.length;

  if (existingDataCount > 0) {
    // 获取现有数据的最大序号
    const maxIndex = Math.max(...allData.map((item) => item.index || 0), 0);

    // 更新新数据的序号，从最大序号+1开始
    newData.forEach((item, idx) => {
      item.index = maxIndex + idx + 1;
    });

    // 合并数据，保留现有 sessionId 颜色映射
    allData = [...allData, ...newData];
    fileInfo.style.display = "block";
    fileInfo.style.background = "#e8f5e9";
    fileInfo.style.color = "#2e7d32";
    fileInfo.innerHTML = `✅ ${sourceName}导入成功 | 导入 <strong>${newData.length}</strong> 条记录 | 原有 <strong>${existingDataCount}</strong> 条 | 总计 <strong>${allData.length}</strong> 条记录`;
  } else {
    // 首次导入（没有现有数据），重置颜色映射
    sessionIdColorMap.clear();
    nextColorIndex = 0;
    allData = [...newData];
    fileInfo.style.display = "block";
    fileInfo.style.background = "#e8f5e9";
    fileInfo.style.color = "#2e7d32";
    fileInfo.innerHTML = `✅ ${sourceName}导入成功 | 共 <strong>${allData.length}</strong> 条记录`;
  }

  // 更新事件筛选器
  updateEventFilter();

  // 重置到第一页
  currentPage = 1;

  // 重新应用筛选
  applyFilters();

  // 显示结果区域（如果之前隐藏）
  if (resultSection) {
    resultSection.style.display = "block";
  }

  return true;
}

// 处理剪贴板导入
window.importFromClipboard = async function () {
  const fileInfo = document.getElementById("fileInfo");

  if (!fileInfo) {
    console.error("fileInfo元素未初始化");
    return;
  }

  // 检查 Clipboard API 是否可用
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    fileInfo.style.display = "block";
    fileInfo.style.background = "#ffebee";
    fileInfo.style.color = "#c62828";
    fileInfo.textContent = "❌ 浏览器不支持剪贴板 API，请使用文件导入功能";
    return;
  }

  // 显示加载状态
  fileInfo.style.display = "block";
  fileInfo.style.background = "#e3f2fd";
  fileInfo.style.color = "#1565c0";
  fileInfo.textContent = "正在读取剪贴板...";

  try {
    // 读取剪贴板内容
    const clipboardText = await navigator.clipboard.readText();

    // 使用通用函数处理 JSON 数据
    const success = processJSONData(clipboardText, "剪贴板内容");
    if (!success) {
      return;
    }
  } catch (error) {
    console.error("剪贴板导入错误:", error);
    fileInfo.style.background = "#ffebee";
    fileInfo.style.color = "#c62828";

    // 根据错误类型显示不同的错误消息
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      fileInfo.textContent =
        "❌ 无法访问剪贴板，请检查浏览器权限设置或使用文件导入功能";
    } else {
      fileInfo.textContent = `❌ 剪贴板导入失败: ${error.message}`;
    }
  }
};

// 显示文本导入模态框
window.showTextImportModal = function () {
  const textImportModal = document.getElementById("textImportModal");
  const textImportTextarea = document.getElementById("textImportTextarea");
  const textImportInfo = document.getElementById("textImportInfo");

  if (textImportModal) {
    textImportModal.style.display = "block";

    // 清空文本编辑框和错误信息
    if (textImportTextarea) {
      textImportTextarea.value = "";
    }
    if (textImportInfo) {
      textImportInfo.style.display = "none";
      textImportInfo.textContent = "";
    }

    // 设置关闭按钮事件
    const closeBtn = textImportModal.querySelector(".detail-modal-close");
    if (closeBtn) {
      closeBtn.onclick = function () {
        hideTextImportModal();
      };
    }

    // 点击背景关闭
    textImportModal.onclick = function (event) {
      if (event.target === textImportModal) {
        hideTextImportModal();
      }
    };

    // 聚焦到文本编辑框
    if (textImportTextarea) {
      setTimeout(() => {
        textImportTextarea.focus();
      }, 100);
    }
  }
};

// 隐藏文本导入模态框
window.hideTextImportModal = function () {
  const textImportModal = document.getElementById("textImportModal");
  if (textImportModal) {
    textImportModal.style.display = "none";
    // 清空文本编辑框和错误信息
    const textImportTextarea = document.getElementById("textImportTextarea");
    const textImportInfo = document.getElementById("textImportInfo");
    if (textImportTextarea) {
      textImportTextarea.value = "";
    }
    if (textImportInfo) {
      textImportInfo.style.display = "none";
      textImportInfo.textContent = "";
    }
  }
};

// 解析时间字符串为 datetime-local 格式
function parseTimeString(timeStr) {
  if (!timeStr || !timeStr.trim()) {
    return null;
  }

  const trimmed = timeStr.trim();

  // 尝试解析各种时间格式
  let date = null;

  // 格式1: YYYY-MM-DD HH:mm:ss (优先处理，用户常用格式)
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    // 将空格替换为T，转换为ISO格式: 2026-02-04 20:06:30 -> 2026-02-04T20:06:30
    date = new Date(trimmed.replace(" ", "T"));
  }
  // 格式2: YYYY-MM-DD HH:mm (不带秒)
  else if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/.test(trimmed)) {
    date = new Date(trimmed.replace(" ", "T"));
  }
  // 格式3: YYYY-MM-DDTHH:mm (datetime-local 标准格式)
  else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    date = new Date(trimmed);
  }
  // 格式4: YYYY/MM/DD HH:mm:ss
  else if (/^\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    date = new Date(trimmed.replace(/\//g, "-").replace(" ", "T"));
  }
  // 格式5: 时间戳（毫秒）
  else if (/^\d{13}$/.test(trimmed)) {
    date = new Date(parseInt(trimmed, 10));
  }
  // 格式6: 时间戳（秒）
  else if (/^\d{10}$/.test(trimmed)) {
    date = new Date(parseInt(trimmed, 10) * 1000);
  }
  // 格式7: ISO 8601 格式或其他格式
  else {
    date = new Date(trimmed);
  }

  if (date && !isNaN(date.getTime())) {
    // 转换为 YYYY-MM-DD HH:mm:ss 格式
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  return null;
}

// 显示查询日志模态框
window.showQueryLogModal = function () {
  const queryLogModal = document.getElementById("queryLogModal");
  const queryLogKeyword = document.getElementById("queryLogKeyword");
  const queryLogTime = document.getElementById("queryLogTime");

  if (queryLogModal) {
    queryLogModal.style.display = "block";

    // 清空输入框
    if (queryLogKeyword) {
      queryLogKeyword.value = "";
    }
    if (queryLogTime) {
      // 设置默认时间为当前时间，使用 YYYY-MM-DD HH:mm:ss 格式
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      queryLogTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      // 只在第一次打开时绑定事件监听器
      if (!queryLogTime.dataset.listenersBound) {
        // 添加粘贴事件处理
        queryLogTime.addEventListener("paste", function (e) {
          setTimeout(() => {
            const pastedValue = queryLogTime.value;
            const parsedTime = parseTimeString(pastedValue);
            if (parsedTime) {
              queryLogTime.value = parsedTime;
            }
          }, 10);
        });

        // 添加失焦事件处理（当用户输入后离开输入框时，尝试格式化）
        queryLogTime.addEventListener("blur", function () {
          const inputValue = queryLogTime.value;
          if (inputValue && inputValue.trim()) {
            const parsedTime = parseTimeString(inputValue);
            if (parsedTime) {
              queryLogTime.value = parsedTime;
            }
          }
        });

        queryLogTime.dataset.listenersBound = "true";
      }
    }

    // 设置关闭按钮事件
    const closeBtn = queryLogModal.querySelector(".detail-modal-close");
    if (closeBtn) {
      closeBtn.onclick = function () {
        hideQueryLogModal();
      };
    }

    // 点击背景关闭
    queryLogModal.onclick = function (event) {
      if (event.target === queryLogModal) {
        hideQueryLogModal();
      }
    };

    // 聚焦到关键词输入框
    if (queryLogKeyword) {
      setTimeout(() => {
        queryLogKeyword.focus();
      }, 100);
    }
  }
};

// 隐藏查询日志模态框
window.hideQueryLogModal = function () {
  const queryLogModal = document.getElementById("queryLogModal");
  if (queryLogModal) {
    queryLogModal.style.display = "none";
  }
};

// 执行查询日志
window.executeQueryLog = function () {
  const queryLogKeyword = document.getElementById("queryLogKeyword");
  const queryLogTime = document.getElementById("queryLogTime");

  if (!queryLogKeyword || !queryLogTime) {
    console.error("查询日志输入框未找到");
    return;
  }

  const keyword = queryLogKeyword.value.trim();
  let timeValue = queryLogTime.value.trim();

  // 验证输入
  if (!keyword) {
    alert("请输入包含项");
    return;
  }

  if (!timeValue) {
    alert("请输入发生时间");
    return;
  }

  // 尝试解析时间（支持粘贴的各种格式）
  const parsedTime = parseTimeString(timeValue);
  if (parsedTime) {
    timeValue = parsedTime;
    // 更新输入框显示格式化的时间
    queryLogTime.value = parsedTime;
  }

  // 构建URL
  const baseUrl =
    "https://grafana.xkdevops.com/explore?schemaVersion=1&panes=%7B%22fk0%22:%7B%22datasource%22:%22cezf9yu571vcwc%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22expr%22:%22%7Bapp%3D%5C%22miniprogram-api%5C%22%7D%20%7C~%20%60XXXXXX%60%22,%22queryType%22:%22range%22,%22datasource%22:%7B%22type%22:%22loki%22,%22uid%22:%22cezf9yu571vcwc%22%7D,%22editorMode%22:%22builder%22%7D,%7B%22refId%22:%22B%22,%22expr%22:%22%7Bapp%3D%5C%22report-api%5C%22%7D%20%7C~%20%60XXXXXX%60%22,%22queryType%22:%22range%22,%22datasource%22:%7B%22type%22:%22loki%22,%22uid%22:%22cezf9yu571vcwc%22%7D,%22editorMode%22:%22builder%22%7D%5D,%22range%22:%7B%22from%22:%22timeA%22,%22to%22:%22timeB%22%7D%7D%7D";

  // 编码关键词
  const encodedKeyword = encodeURIComponent(keyword);

  // 替换所有XXXXXX
  let url = baseUrl.replace(/XXXXXX/g, encodedKeyword);

  // 处理时间：将 YYYY-MM-DD HH:mm:ss 格式转换为 Date 对象可识别的格式
  // 如果已经是 YYYY-MM-DD HH:mm:ss 格式，需要将空格替换为 T
  const timeValueForDate = timeValue.includes("T") 
    ? timeValue 
    : timeValue.replace(" ", "T");
  const selectedTime = new Date(timeValueForDate);
  if (isNaN(selectedTime.getTime())) {
    alert("时间格式不正确，请使用格式：YYYY-MM-DD HH:mm:ss");
    return;
  }

  // 计算时间戳（毫秒）
  const timeStamp = selectedTime.getTime();

  // 减去30分钟（30 * 60 * 1000 毫秒）
  const timeA = timeStamp - 30 * 60 * 1000;
  // 加上30分钟
  const timeB = timeStamp + 30 * 60 * 1000;

  // 将时间戳转换为ISO格式字符串（Grafana需要的格式）
  const timeAStr = new Date(timeA).toISOString();
  const timeBStr = new Date(timeB).toISOString();

  // 替换timeA和timeB
  url = url.replace("timeA", encodeURIComponent(timeAStr));
  url = url.replace("timeB", encodeURIComponent(timeBStr));

  // 打开新窗口
  window.open(url, "_blank");

  // 不关闭弹窗，让用户可以继续查询
};

// 处理文本导入
window.processTextImport = function () {
  const textImportTextarea = document.getElementById("textImportTextarea");
  const textImportInfo = document.getElementById("textImportInfo");

  if (!textImportTextarea) {
    console.error("textImportTextarea元素未初始化");
    return;
  }

  const textContent = textImportTextarea.value;

  // 检查文本是否为空
  if (!textContent || textContent.trim() === "") {
    if (textImportInfo) {
      textImportInfo.style.display = "block";
      textImportInfo.style.background = "#ffebee";
      textImportInfo.style.color = "#c62828";
      textImportInfo.textContent = "❌ 请输入 JSON 数据";
    }
    return;
  }

  // 显示处理中状态
  if (textImportInfo) {
    textImportInfo.style.display = "block";
    textImportInfo.style.background = "#e3f2fd";
    textImportInfo.style.color = "#1565c0";
    textImportInfo.textContent = "正在处理文本数据...";
  }

  // 使用通用函数处理 JSON 数据（但使用模态框内的信息显示区域）
  const fileInfo = document.getElementById("fileInfo");
  const originalDisplay = fileInfo ? fileInfo.style.display : "none";

  // 临时创建一个处理函数，使用模态框内的信息显示区域
  function processTextJSONData(jsonText, sourceName = "文本内容") {
    const infoElement = textImportInfo || fileInfo;

    if (!infoElement) {
      console.error("信息显示元素未初始化");
      return false;
    }

    // 检查文本是否为空
    if (!jsonText || jsonText.trim() === "") {
      infoElement.style.display = "block";
      infoElement.style.background = "#ffebee";
      infoElement.style.color = "#c62828";
      infoElement.textContent = `❌ ${sourceName}为空，请先输入 JSON 数据`;
      return false;
    }

    // 验证并解析 JSON
    let jsonData;
    try {
      jsonData = JSON.parse(jsonText);
    } catch (parseError) {
      infoElement.style.display = "block";
      infoElement.style.background = "#ffebee";
      infoElement.style.color = "#c62828";
      infoElement.textContent = `❌ ${sourceName}不是有效的 JSON 格式: ${parseError.message}`;
      return false;
    }

    // 如果解析结果是单个对象，将其包装成数组
    if (!Array.isArray(jsonData)) {
      if (typeof jsonData === "object" && jsonData !== null) {
        jsonData = [jsonData];
      } else {
        infoElement.style.display = "block";
        infoElement.style.background = "#ffebee";
        infoElement.style.color = "#c62828";
        infoElement.textContent = `❌ ${sourceName}格式不正确，请确保是 JSON 对象或数组`;
        return false;
      }
    }

    // 验证数组不为空
    if (jsonData.length === 0) {
      infoElement.style.display = "block";
      infoElement.style.background = "#ffebee";
      infoElement.style.color = "#c62828";
      infoElement.textContent = `❌ ${sourceName}为空数组，请确保包含日志数据`;
      return false;
    }

    // 解析新数据
    const newData = parseMiniprogramData(jsonData);

    if (newData.length === 0) {
      infoElement.style.display = "block";
      infoElement.style.background = "#ffebee";
      infoElement.style.color = "#c62828";
      infoElement.textContent = `❌ ${sourceName}中没有有效的日志记录`;
      return false;
    }

    // 合并数据：始终合并，保留现有数据
    const existingDataCount = allData.length;

    if (existingDataCount > 0) {
      // 获取现有数据的最大序号
      const maxIndex = Math.max(...allData.map((item) => item.index || 0), 0);

      // 更新新数据的序号，从最大序号+1开始
      newData.forEach((item, idx) => {
        item.index = maxIndex + idx + 1;
      });

      // 合并数据，保留现有 sessionId 颜色映射
      allData = [...allData, ...newData];
      infoElement.style.display = "block";
      infoElement.style.background = "#e8f5e9";
      infoElement.style.color = "#2e7d32";
      infoElement.innerHTML = `✅ ${sourceName}导入成功 | 导入 <strong>${newData.length}</strong> 条记录 | 原有 <strong>${existingDataCount}</strong> 条 | 总计 <strong>${allData.length}</strong> 条记录`;
    } else {
      // 首次导入（没有现有数据），重置颜色映射
      sessionIdColorMap.clear();
      nextColorIndex = 0;
      allData = [...newData];
      infoElement.style.display = "block";
      infoElement.style.background = "#e8f5e9";
      infoElement.style.color = "#2e7d32";
      infoElement.innerHTML = `✅ ${sourceName}导入成功 | 共 <strong>${allData.length}</strong> 条记录`;
    }

    // 更新事件筛选器
    updateEventFilter();

    // 重置到第一页
    currentPage = 1;

    // 重新应用筛选
    applyFilters();

    // 显示结果区域（如果之前隐藏）
    if (resultSection) {
      resultSection.style.display = "block";
    }

    return true;
  }

  // 处理文本内容
  const success = processTextJSONData(textContent, "文本内容");

  if (success) {
    // 导入成功，延迟关闭模态框
    setTimeout(() => {
      hideTextImportModal();
      // 在主页面显示成功消息
      if (fileInfo) {
        fileInfo.style.display = "block";
        fileInfo.style.background = "#e8f5e9";
        fileInfo.style.color = "#2e7d32";
        fileInfo.textContent = "✅ 文本导入成功";
      }
    }, 1500);
  }
};

// 显示tooltip
window.showTooltip = function (event, cell) {
  const tooltip = cell.querySelector(".properties-tooltip");
  if (!tooltip) return;

  const rect = cell.getBoundingClientRect();
  tooltip.style.display = "block";
  const tooltipRect = tooltip.getBoundingClientRect();
  const tooltipWidth = tooltipRect.width || 400;
  const tooltipHeight = tooltipRect.height || 300;

  let left = rect.left - tooltipWidth - 8;
  let top = rect.top;

  if (left < 10) {
    left = rect.right + 8;
  }
  if (left + tooltipWidth > window.innerWidth - 10) {
    left = rect.left;
    top = rect.bottom + 4;
  }
  if (top + tooltipHeight > window.innerHeight - 10) {
    top = window.innerHeight - tooltipHeight - 10;
  }
  if (top < 10) {
    top = 10;
  }

  tooltip.style.left = left + "px";
  tooltip.style.top = top + "px";
};

// 隐藏tooltip
window.hideTooltip = function () {
  const tooltips = document.querySelectorAll(".properties-tooltip");
  tooltips.forEach((t) => (t.style.display = "none"));
};

// 显示支付详情tooltip
window.showPayTooltip = function (event, wrapper) {
  const tooltip = wrapper.querySelector(".pay-tooltip");
  if (!tooltip) return;

  const rect = wrapper.getBoundingClientRect();
  tooltip.style.display = "block";
  const tooltipRect = tooltip.getBoundingClientRect();
  const tooltipWidth = tooltipRect.width || 320;
  const tooltipHeight = tooltipRect.height || 200;

  let left = rect.left;
  let top = rect.bottom + 4;

  if (top + tooltipHeight > window.innerHeight - 10) {
    top = rect.top - tooltipHeight - 4;
  }
  if (left + tooltipWidth > window.innerWidth - 10) {
    left = window.innerWidth - tooltipWidth - 10;
  }
  if (left < 10) {
    left = 10;
  }
  if (top < 10) {
    top = rect.bottom + 4;
  }

  tooltip.style.left = left + "px";
  tooltip.style.top = top + "px";
};

// 隐藏支付详情tooltip
window.hidePayTooltip = function () {
  const tooltips = document.querySelectorAll(".pay-tooltip");
  tooltips.forEach((t) => (t.style.display = "none"));
};

// 显示详情弹窗
// 树形结构交互函数
window.toggleTreeSection = function (sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.toggle("collapsed");
  }
};

window.toggleTreeNode = function (nodeId) {
  const node = document.getElementById(nodeId);
  if (node) {
    node.classList.toggle("collapsed");
  }
};

window.showDetailModal = function (itemData) {
  const modal = document.getElementById("detailModal");
  if (!modal) return;

  // 填充弹窗内容
  const titleEl = document.getElementById("modalEventTitle");
  const descEl = document.getElementById("modalEventDesc");
  const detailEl = document.getElementById("modalEventDetail");
  const propertiesEl = document.getElementById("modalProperties");

  if (titleEl)
    titleEl.textContent = itemData.desc || itemData.event || "未知事件";
  if (descEl) descEl.textContent = itemData.detail || "";

  // 获取事件详情（复用现有逻辑）
  const eventDetail = getEventDetail(itemData);
  if (detailEl) detailEl.innerHTML = eventDetail;

  // 格式化属性信息
  if (propertiesEl) {
    propertiesEl.textContent = JSON.stringify(itemData.rawData || {}, null, 2);
  }

  // 显示弹窗
  modal.style.display = "block";

  // 添加关闭事件
  const closeBtn = modal.querySelector(".detail-modal-close");
  if (closeBtn) {
    closeBtn.onclick = function () {
      modal.style.display = "none";
    };
  }

  // 点击背景关闭
  modal.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // ESC键关闭
  const handleEsc = function (event) {
    if (event.key === "Escape") {
      modal.style.display = "none";
      document.removeEventListener("keydown", handleEsc);
    }
  };
  document.addEventListener("keydown", handleEsc);
};
