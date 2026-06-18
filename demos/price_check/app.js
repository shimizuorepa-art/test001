const facilities = [
  { id: "O-A", name: "東海営業部", area: "東海" },
  { id: "O-B", name: "名古屋営業チーム", area: "東海" },
  { id: "O-C", name: "関東営業チーム", area: "関東" },
  { id: "O-D", name: "九州営業チーム", area: "九州" },
];

const activityNames = [
  "ガステーブル",
  "ガスレンジ",
  "シンク",
  "作業台",
  "フライヤー",
  "ゆで麺器",
  "洗浄機",
  "冷蔵コールドテーブル",
  "ステンレス棚",
  "排気フード",
  "保守部品",
  "設置関連部材",
];

const customerTypes = ["標準", "特注", "保守"];
const seasons = ["通常納期", "短納期", "大型案件"];

const meals = [
  { id: "S001", name: "標準仕様", price: 13200 },
  { id: "S002", name: "サイズ変更", price: 15400 },
  { id: "S003", name: "左勝手仕様", price: 17600 },
  { id: "S004", name: "右勝手仕様", price: 19800 },
  { id: "S005", name: "搬入調整あり", price: 22000 },
  { id: "S006", name: "設置作業あり", price: 25300 },
  { id: "S007", name: "保守部品同梱", price: 28600 },
  { id: "S008", name: "短納期対応", price: 33000 },
];

const knowledgeBase = [
  {
    id: "KB-01",
    title: "商品条件マスタ運用ルール",
    body:
      "顧客提示用の資料は、承認済み商品条件マスタを正本として作成する。旧版資料との差異がある行は、ステータスを要確認にして承認完了まで外部提示しない。",
    tags: ["条件", "マスタ", "差異", "正本", "承認"],
  },
  {
    id: "KB-02",
    title: "提案確認メモ作成ルール",
    body:
      "提案確認メモには管理ID、品目、仕様、数量、税込条件、税込合計、適用条件を記載する。条件の根拠として参照したマスタ更新日を内部メモに残す。",
    tags: ["提案書", "資料", "数量", "税込", "根拠"],
  },
  {
    id: "KB-03",
    title: "入力受付確認ルール",
    body:
      "入力受付確認では、顧客依頼内容、社内受付登録、仕入先または工場への入力状況、納期回答が一致していることを確認する。",
    tags: ["入力受付", "入力", "受付", "登録", "履歴"],
  },
  {
    id: "KB-04",
    title: "公開・最終確認ルール",
    body:
      "公開前確認では受付登録、公開先、公開予定日または公開完了を確認する。最終確認では公開完了、確認先、締日、支払条件を確認する。",
    tags: ["公開", "確認", "確認", "完了", "差分", "備考"],
  },
  {
    id: "KB-05",
    title: "共通運用化移行メモ",
    body:
      "担当者ごとに異なる確認手順は、受付、確認、承認、確認メモ、保管の工程に分ける。共通チェックリストで処理品質をそろえる。",
    tags: ["共通運用", "手順", "整理", "チェックリスト"],
  },
];

const state = {
  rows: [],
  filteredRows: [],
  selectedRow: null,
  docType: "quote",
};

const formatYen = (value) =>
  new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);

function generateRows() {
  const rows = [];
  facilities.forEach((facility, facilityIndex) => {
    activityNames.forEach((activityName, activityIndex) => {
      customerTypes.forEach((customerType, customerIndex) => {
        seasons.forEach((season, seasonIndex) => {
          const activityId = `P${String(rows.length + 1).padStart(4, "0")}`;
          const activityPrice =
            98000 +
            facilityIndex * 18000 +
            activityIndex * 12000 +
            customerIndex * 26000 +
            seasonIndex * 19000;
          meals.forEach((meal, mealIndex) => {
            const total = activityPrice + meal.price;
            const needsReview = (rows.length + 1) % 41 === 0;
            rows.push({
              id: `${activityId}-${meal.id}`,
              planId: activityId,
              facility: facility.name,
              area: facility.area,
              item: `${activityName} ${customerType}`,
              detail: `${season} / ${facility.area}担当`,
              customerType,
              season,
              meal: meal.name,
              mealId: meal.id,
              activityPrice,
              mealPrice: meal.price,
              total,
              sourceTotal: needsReview ? total + 1100 : total,
              diff: needsReview ? -1100 : 0,
              status: needsReview ? "要確認" : "OK",
            });
          });
        });
      });
    });
  });
  return rows;
}

function optionMarkup(values, allLabel) {
  return [`<option value="">${allLabel}</option>`, ...values.map((value) => `<option value="${value}">${value}</option>`)].join("");
}

function initFilters() {
  document.getElementById("facilityFilter").innerHTML = optionMarkup(
    facilities.map((item) => item.name),
    "すべて"
  );
  document.getElementById("customerFilter").innerHTML = optionMarkup(customerTypes, "すべて");
  document.getElementById("seasonFilter").innerHTML = optionMarkup(seasons, "すべて");
  document.getElementById("mealFilter").innerHTML = optionMarkup(
    meals.map((item) => item.name),
    "すべて"
  );
}

function getFilters() {
  return {
    keyword: document.getElementById("keywordInput").value.trim().toLowerCase(),
    facility: document.getElementById("facilityFilter").value,
    customerType: document.getElementById("customerFilter").value,
    season: document.getElementById("seasonFilter").value,
    meal: document.getElementById("mealFilter").value,
    priceMax: Number(document.getElementById("priceRange").value),
  };
}

function applyFilters() {
  const filters = getFilters();
  state.filteredRows = state.rows.filter((row) => {
    const haystack = `${row.id} ${row.planId} ${row.facility} ${row.item} ${row.detail} ${row.meal}`.toLowerCase();
    return (
      (!filters.keyword || haystack.includes(filters.keyword)) &&
      (!filters.facility || row.facility === filters.facility) &&
      (!filters.customerType || row.customerType === filters.customerType) &&
      (!filters.season || row.season === filters.season) &&
      (!filters.meal || row.meal === filters.meal) &&
      row.total <= filters.priceMax
    );
  });

  if (!state.selectedRow || !state.filteredRows.some((row) => row.id === state.selectedRow.id)) {
    state.selectedRow = state.filteredRows[0] || state.rows[0];
  }

  renderTable();
  renderMetrics();
  renderDocument();
}

function renderMetrics() {
  const issueCount = state.filteredRows.filter((row) => row.status !== "OK").length;
  document.getElementById("metricTotal").textContent = state.rows.length.toLocaleString("ja-JP");
  document.getElementById("metricMatches").textContent = state.filteredRows.length.toLocaleString("ja-JP");
  document.getElementById("metricIssues").textContent = `${issueCount}件`;
  document.getElementById("metricSelected").textContent = state.selectedRow
    ? state.selectedRow.id
    : "未選択";
}

function renderTable() {
  const body = document.getElementById("priceTableBody");
  const rows = state.filteredRows.slice(0, 80);
  body.innerHTML = rows
    .map(
      (row) => `
        <tr data-row-id="${row.id}" class="${state.selectedRow?.id === row.id ? "is-selected" : ""}">
          <td>${row.facility}</td>
          <td>${row.id}</td>
          <td>${row.item}</td>
          <td>${row.detail}</td>
          <td>${row.meal}</td>
          <td class="num">${formatYen(row.activityPrice)}</td>
          <td class="num">${formatYen(row.mealPrice)}</td>
          <td class="num">${formatYen(row.total)}</td>
          <td class="num">${row.diff === 0 ? "0" : formatYen(row.diff)}</td>
          <td><span class="status ${row.status === "OK" ? "ok" : "warn"}">${row.status}</span></td>
        </tr>
      `
    )
    .join("");

  body.querySelectorAll("tr").forEach((tr) => {
    tr.addEventListener("click", () => {
      const row = state.rows.find((item) => item.id === tr.dataset.rowId);
      if (row) {
        state.selectedRow = row;
        renderTable();
        renderMetrics();
        renderDocument();
      }
    });
  });
}

function scoreSource(query, source) {
  const normalized = query.toLowerCase();
  const words = [...source.tags, ...source.title.split(""), ...source.body.split(/[、。]/)];
  return words.reduce((score, word) => {
    if (!word) return score;
    return normalized.includes(String(word).toLowerCase()) ? score + 1 : score;
  }, 0);
}

function retrieveSources(query, limit = 3) {
  return knowledgeBase
    .map((source) => ({ ...source, score: scoreSource(query, source) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getDocTypeLabel() {
  return {
    quote: "提案書",
    order: "入力受付確認",
    delivery: "公開前確認",
    invoice: "最終確認",
  }[state.docType];
}

function renderDocument() {
  const row = state.selectedRow || state.rows[0];
  const quantity = Math.max(Number(document.getElementById("quantityInput")?.value || 1), 1);
  const customerName = document.getElementById("customerName")?.value || "サンプル製作所株式会社";
  const owner = document.getElementById("ownerInput")?.value || "営業企画部";
  const note = document.getElementById("noteInput")?.value || "";
  const docLabel = getDocTypeLabel();
  const subtotal = row.total * quantity;
  const sources = retrieveSources(`${docLabel} ${row.status} ${note} 条件 マスタ 公開 受付 差異`, 3);

  document.getElementById("documentTitle").textContent = `${docLabel}メモ`;
  document.getElementById("documentSources").innerHTML = sources
    .map(
      (source) => `
        <div class="source-chip">
          <strong>${source.id} ${source.title}</strong>
          <span>${source.body}</span>
        </div>
      `
    )
    .join("");

  document.getElementById("documentPreview").innerHTML = `
    <div class="doc-head">
      <h3>${docLabel}</h3>
      <div class="doc-meta">
        <div>管理番号 SAMPLE-${new Date().getFullYear()}-${row.planId}</div>
        <div>作成部署 ${owner}</div>
        <div>参照マスタ Sample Product Price Master v1.0</div>
      </div>
    </div>
    <p class="doc-customer">${customerName} 御中</p>
    <p>下記の通り、確認内容をご確認ください。</p>
    <div class="doc-total">
      <span>税込合計</span>
      <strong>${formatYen(subtotal)}</strong>
    </div>
    <table class="doc-table">
      <thead>
        <tr>
          <th>項目</th>
          <th>詳細</th>
          <th>数量</th>
          <th>税込条件</th>
          <th>税込金額</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${row.item}</td>
          <td>${row.facility} / ${row.detail} / ${row.meal}</td>
          <td class="num">${quantity}</td>
          <td class="num">${formatYen(row.total)}</td>
          <td class="num">${formatYen(subtotal)}</td>
        </tr>
      </tbody>
    </table>
    <ul class="doc-notes">
      <li>管理ID: ${row.id}</li>
      <li>条件チェック: ${row.status}${row.diff ? `（旧版資料との差異 ${formatYen(row.diff)}）` : ""}</li>
      <li>参照根拠: ${sources.map((source) => source.id).join(" / ")}</li>
      <li>${note}</li>
    </ul>
  `;
}

function renderRagAnswer() {
  const query = document.getElementById("ragQuery").value;
  const sources = retrieveSources(query, 4);
  const answer = sources
    .map(
      (source) => `
        <div class="source-chip">
          <strong>${source.id} ${source.title}</strong>
          <span>${source.body}</span>
        </div>
      `
    )
    .join("");

  document.getElementById("ragAnswer").innerHTML = `
    <div class="answer-block">
      <h3>回答ドラフト</h3>
      <p>商品条件マスタと旧版資料に差異がある場合は、外部提示前に「要確認」として扱います。確認メモでは承認済みマスタを参照し、承認完了前の行は提案・入力受付・公開・最終確認の対象から外す運用が安全です。</p>
      <ul>
        <li>差異行は承認状態が確認できるまで保留。</li>
        <li>資料には管理ID、数量、税込条件、税込合計、参照マスタを残す。</li>
        <li>変更履歴と確認者を残すことで、営業・運用の判断基準をそろえる。</li>
      </ul>
    </div>
    <div class="answer-block">
      <h3>参照ソース</h3>
      ${answer}
    </div>
  `;
}

function switchView(viewName) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("is-visible", view.id === `view-${viewName}`);
  });
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewName);
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

function bindEvents() {
  ["keywordInput", "facilityFilter", "customerFilter", "seasonFilter", "mealFilter", "priceRange"].forEach(
    (id) => {
      document.getElementById(id).addEventListener("input", () => {
        if (id === "priceRange") {
          document.getElementById("priceRangeLabel").textContent = `${Number(
            document.getElementById(id).value
          ).toLocaleString("ja-JP")}円以下`;
        }
        applyFilters();
      });
    }
  );

  document.getElementById("resetFilters").addEventListener("click", () => {
    document.getElementById("keywordInput").value = "";
    document.getElementById("facilityFilter").value = "";
    document.getElementById("customerFilter").value = "";
    document.getElementById("seasonFilter").value = "";
    document.getElementById("mealFilter").value = "";
    document.getElementById("priceRange").value = "900000";
    document.getElementById("priceRangeLabel").textContent = "900,000円以下";
    applyFilters();
  });

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      state.docType = button.dataset.docType;
      document.querySelectorAll(".segment").forEach((segment) => {
        segment.classList.toggle("is-active", segment === button);
      });
      renderDocument();
    });
  });

  ["customerName", "quantityInput", "ownerInput", "noteInput"].forEach((id) => {
    document.getElementById(id).addEventListener("input", renderDocument);
  });

  document.getElementById("quoteFromSelected").addEventListener("click", () => {
    state.docType = "quote";
    document.querySelectorAll(".segment").forEach((segment) => {
      segment.classList.toggle("is-active", segment.dataset.docType === "quote");
    });
    switchView("documents");
    renderDocument();
  });

  document.getElementById("copySelected").addEventListener("click", async () => {
    if (!state.selectedRow) return;
    const text = `${state.selectedRow.id} ${state.selectedRow.item} ${state.selectedRow.meal} ${formatYen(
      state.selectedRow.total
    )}`;
    await navigator.clipboard?.writeText(text);
    showToast("選択中の商品行をコピーしました");
  });

  document.getElementById("copyDocument").addEventListener("click", async () => {
    await navigator.clipboard?.writeText(document.getElementById("documentPreview").innerText);
    showToast("確認メモをコピーしました");
  });

  document.getElementById("printSample").addEventListener("click", () => {
    showToast("PDF表示はサンプルです");
  });

  document.getElementById("generateDocument").addEventListener("click", () => {
    renderDocument();
    showToast("社内資料参照付きで確認メモを更新しました");
  });

  document.getElementById("runRag").addEventListener("click", renderRagAnswer);
}

function init() {
  state.rows = generateRows();
  state.filteredRows = [...state.rows];
  state.selectedRow = state.rows[0];
  initFilters();
  bindEvents();
  applyFilters();
  renderRagAnswer();
}

init();
