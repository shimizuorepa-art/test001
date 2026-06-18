const months = ["5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月"];

const clients = [
  {
    id: "C-01",
    name: "取引先A",
    type: "販売代理店",
    office: "toyohashi",
    owner: "営業担当A",
    base: [42, 58, 66, 51, 74, 62, 86, 92, 48, 57, 69, 78],
    previous: [36, 55, 61, 57, 55, 66, 71, 80, 52, 46, 62, 70],
    target: [40, 56, 63, 58, 68, 65, 84, 88, 50, 54, 68, 75],
  },
  {
    id: "C-02",
    name: "取引先B",
    type: "設計運用所",
    office: "tokai",
    owner: "営業担当B",
    base: [18, 24, 31, 29, 44, 52, 40, 36, 28, 33, 39, 45],
    previous: [20, 18, 25, 24, 30, 35, 37, 31, 22, 25, 34, 38],
    target: [22, 24, 28, 29, 38, 46, 42, 35, 28, 31, 38, 42],
  },
  {
    id: "C-03",
    name: "取引先C",
    type: "直販重点先",
    office: "west",
    owner: "営業担当C",
    base: [56, 49, 64, 60, 70, 80, 76, 88, 72, 81, 83, 95],
    previous: [61, 55, 66, 62, 71, 73, 78, 82, 76, 78, 80, 88],
    target: [58, 56, 66, 64, 72, 78, 82, 86, 76, 80, 84, 92],
  },
  {
    id: "C-04",
    name: "取引先D",
    type: "販売代理店",
    office: "tokai",
    owner: "営業担当A",
    base: [0, 14, 18, 20, 0, 24, 26, 28, 30, 34, 0, 38],
    previous: [12, 13, 20, 18, 17, 22, 24, 24, 25, 30, 28, 35],
    target: [12, 15, 18, 20, 18, 25, 26, 28, 30, 32, 34, 38],
  },
  {
    id: "C-05",
    name: "取引先E",
    type: "施工会社",
    office: "west",
    owner: "営業担当D",
    base: [22, 18, 16, 15, 13, 12, 18, 20, 14, 13, 16, 17],
    previous: [28, 25, 26, 24, 22, 20, 24, 27, 20, 19, 22, 21],
    target: [25, 23, 24, 22, 20, 19, 22, 24, 18, 18, 20, 20],
  },
  {
    id: "C-06",
    name: "取引先F",
    type: "新規開拓先",
    office: "toyohashi",
    owner: "営業担当B",
    base: [0, 0, 8, 16, 24, 31, 45, 52, 46, 50, 58, 64],
    previous: [0, 0, 0, 4, 8, 12, 20, 26, 25, 30, 34, 36],
    target: [0, 0, 10, 18, 24, 32, 42, 50, 48, 52, 56, 62],
  },
  {
    id: "C-07",
    name: "取引先G",
    type: "保守部品",
    office: "tokai",
    owner: "営業担当C",
    base: [34, 38, 32, 41, 36, 48, 42, 46, 39, 43, 44, 47],
    previous: [32, 35, 33, 36, 34, 40, 39, 42, 38, 40, 41, 44],
    target: [34, 36, 34, 38, 36, 44, 42, 44, 40, 42, 44, 46],
  },
  {
    id: "C-08",
    name: "取引先H",
    type: "重点フォロー",
    office: "west",
    owner: "営業担当D",
    base: [48, 42, 35, 30, 28, 24, 22, 20, 18, 16, 19, 21],
    previous: [40, 43, 46, 45, 42, 39, 36, 34, 31, 29, 27, 26],
    target: [44, 42, 40, 38, 36, 34, 32, 30, 28, 26, 26, 26],
  },
];

const state = {
  metric: "orders",
  compare: "previous",
  office: "all",
  hideInactive: true,
  selectedClientId: "C-01",
  selectedMonth: 4,
};

const yen = (value) => `${Math.round(value * 8.6).toLocaleString("ja-JP")}万円`;
const count = (value) => `${Math.round(value).toLocaleString("ja-JP")}件`;

function valueLabel(value) {
  return state.metric === "sales" ? yen(value) : count(value);
}

function displayValue(value) {
  return state.metric === "sales" ? Math.round(value * 8.6) : Math.round(value);
}

function compareRate(current, base) {
  if (!base) return current ? 100 : 0;
  return Math.round(((current - base) / base) * 100);
}

function rateClass(rate) {
  if (rate >= 20) return "cell-good";
  if (rate <= -15) return "cell-bad";
  return "cell-mid";
}

function filteredClients() {
  return clients.filter((client) => {
    const officeMatch = state.office === "all" || client.office === state.office;
    const hasActivity = !state.hideInactive || client.base.some((value) => value > 0);
    return officeMatch && hasActivity;
  });
}

function total(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

function clientScore(client) {
  return compareRate(total(client.base), total(client.previous));
}

function renderSummary() {
  const rows = filteredClients();
  const current = rows.reduce((sum, client) => sum + total(client.base), 0);
  const previous = rows.reduce((sum, client) => sum + total(client.previous), 0);
  const rate = compareRate(current, previous);

  document.getElementById("totalMetric").textContent = valueLabel(current);
  document.getElementById("totalCompare").textContent = `${rate >= 0 ? "▲" : "▼"} ${Math.abs(rate)}% / 前年比`;

  const sorted = [...rows].sort((a, b) => clientScore(b) - clientScore(a));
  document.getElementById("growthList").innerHTML = listMarkup(sorted.slice(0, 3));
  document.getElementById("riskList").innerHTML = listMarkup(sorted.slice(-3).reverse(), true);

  const selected = clients.find((client) => client.id === state.selectedClientId) || rows[0];
  document.getElementById("supportMemo").textContent = selected
    ? `${selected.name}は${selected.owner}が担当。伸長月と減少月を同じ画面で確認し、訪問前の優先確認事項を整理できます。`
    : "表示条件に合う取引先がありません。";
}

function listMarkup(items, risk = false) {
  return `
    <div class="rank-list">
      ${items
        .map((client) => {
          const score = clientScore(client);
          return `
            <div class="rank-item ${risk ? "is-risk" : ""}">
              <strong>${client.name}（${client.type}）</strong>
              <em>${score >= 0 ? "▲" : "▼"} ${Math.abs(score)}%</em>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderMatrix() {
  const rows = filteredClients();
  document.getElementById("matrixHead").innerHTML = `
    <tr>
      <th class="rank-cell">順位</th>
      <th class="client-cell">取引先</th>
      <th>区分</th>
      ${months.map((month) => `<th>${month}</th>`).join("")}
    </tr>
  `;

  document.getElementById("matrixBody").innerHTML = rows
    .map((client, rowIndex) => {
      const cells = client.base
        .map((value, monthIndex) => {
          const base = state.compare === "target" ? client.target[monthIndex] : client.previous[monthIndex];
          const rate = compareRate(value, base);
          const isSelected = client.id === state.selectedClientId && monthIndex === state.selectedMonth;
          const className = value ? rateClass(rate) : "cell-empty";
          return `
            <td class="month-cell ${className}" data-client="${client.id}" data-month="${monthIndex}" aria-selected="${isSelected}">
              ${
                value
                  ? `<strong>${valueLabel(value)}</strong><small>${rate >= 0 ? "+" : ""}${rate}%</small>`
                  : "<strong>-</strong><small>未計上</small>"
              }
            </td>
          `;
        })
        .join("");

      return `
        <tr class="${client.id === state.selectedClientId ? "selected-row" : ""}">
          <td class="rank-cell">${rowIndex + 1}</td>
          <td class="client-cell">${client.name}</td>
          <td>${client.type}</td>
          ${cells}
        </tr>
      `;
    })
    .join("");

  document.querySelectorAll(".month-cell").forEach((cell) => {
    cell.addEventListener("click", () => {
      state.selectedClientId = cell.dataset.client;
      state.selectedMonth = Number(cell.dataset.month);
      render();
    });
  });
}

function renderDetail() {
  const client = clients.find((item) => item.id === state.selectedClientId) || filteredClients()[0];
  if (!client) return;
  const monthIndex = state.selectedMonth;
  const current = client.base[monthIndex];
  const previous = client.previous[monthIndex];
  const target = client.target[monthIndex];
  const previousRate = compareRate(current, previous);
  const targetRate = compareRate(current, target);

  document.getElementById("detailTitle").textContent = `${client.name} 詳細`;
  document.getElementById("detailSubtitle").textContent = `${months[monthIndex]} / ${client.type} / ${client.owner}`;
  document.getElementById("currentValue").textContent = valueLabel(current);
  document.getElementById("previousRate").textContent = `${previousRate >= 0 ? "▲" : "▼"} ${Math.abs(previousRate)}%`;
  document.getElementById("targetRate").textContent = `${targetRate >= 0 ? "▲" : "▼"} ${Math.abs(targetRate)}%`;

  const max = Math.max(...client.base, ...client.previous, ...client.target, 1);
  document.getElementById("trendChart").innerHTML = client.base
    .map(
      (value, index) => `
        <div class="bar" style="height:${Math.max((value / max) * 100, 2)}%">
          <span>${months[index].replace("月", "")}</span>
        </div>
      `
    )
    .join("");

  document.getElementById("detailRows").innerHTML = months
    .map((month, index) => {
      const rate = compareRate(client.base[index], client.previous[index]);
      const targetGap = compareRate(client.base[index], client.target[index]);
      const good = rate >= 0 && targetGap >= -5;
      return `
        <tr>
          <td>${month}</td>
          <td>${valueLabel(client.base[index])}</td>
          <td>${valueLabel(client.previous[index])}</td>
          <td>${valueLabel(client.target[index])}</td>
          <td><span class="badge ${good ? "good" : "bad"}">${good ? "順調" : "要確認"}</span></td>
        </tr>
      `;
    })
    .join("");

  document.getElementById("actionList").innerHTML = actionItems(client, previousRate, targetRate)
    .map((item) => `<li>${item}</li>`)
    .join("");
}

function actionItems(client, previousRate, targetRate) {
  const items = [];
  if (previousRate < -15) {
    items.push("前年から大きく落ちているため、案件流入の減少理由と競合状況を確認する。");
  } else {
    items.push("伸長している月の提案内容を確認し、他案件でも使える確認観点を整理する。");
  }
  if (targetRate < 0) {
    items.push("目標未達のため、次回訪問時に重点商品、納期、提案条件の確認項目を営業担当へ共有する。");
  } else {
    items.push("目標比は順調。継続提案のタイミングと追加商材の候補を営業担当と確認する。");
  }
  items.push(`${client.owner}向けに、月次推移と確認事項を1枚メモ化して商談前準備を支援する。`);
  return items;
}

function bindEvents() {
  document.getElementById("officeFilter").addEventListener("change", (event) => {
    state.office = event.target.value;
    render();
  });

  document.getElementById("hideInactive").addEventListener("change", (event) => {
    state.hideInactive = event.target.checked;
    render();
  });

  document.querySelectorAll("[data-metric]").forEach((button) => {
    button.addEventListener("click", () => {
      state.metric = button.dataset.metric;
      document.querySelectorAll("[data-metric]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      render();
    });
  });

  document.querySelectorAll("[data-compare]").forEach((button) => {
    button.addEventListener("click", () => {
      state.compare = button.dataset.compare;
      document.querySelectorAll("[data-compare]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      render();
    });
  });
}

function render() {
  renderSummary();
  renderMatrix();
  renderDetail();
}

bindEvents();
render();
