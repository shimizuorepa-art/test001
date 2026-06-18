const STORAGE_KEY = "attendance-checkin-sample-v1";

const GROUPS = [
  {
    id: "group-a",
    name: "サンプル団体A",
    note: "受付導線確認用",
    seats: [
      { table: "A1", seat: 1 },
      { table: "A1", seat: 2 },
      { table: "A1", seat: 3 },
      { table: "A2", seat: 1 },
      { table: "A2", seat: 2 },
    ],
  },
  {
    id: "group-b",
    name: "サンプル団体B",
    note: "来場者検索確認用",
    seats: [
      { table: "B1", seat: 1 },
      { table: "B1", seat: 2 },
      { table: "B1", seat: 3 },
      { table: "B2", seat: 1 },
    ],
  },
  {
    id: "group-c",
    name: "サンプル団体C",
    note: "キャンセル確認用",
    seats: [
      { table: "C1", seat: 1 },
      { table: "C1", seat: 2 },
      { table: "C1", seat: 3 },
      { table: "C1", seat: 4 },
    ],
  },
];

const TABLES = [
  { id: "A1", area: "前方", max: 5 },
  { id: "A2", area: "前方", max: 5 },
  { id: "B1", area: "中央", max: 5 },
  { id: "B2", area: "中央", max: 5 },
  { id: "C1", area: "後方", max: 5 },
  { id: "D1", area: "予備", max: 5 },
  { id: "D2", area: "予備", max: 5 },
  { id: "E1", area: "受付横", max: 5 },
];

const FEATURE_LABELS = [
  {
    key: "checkin",
    title: "出席登録ボタン",
    desc: "当日受付処理を一時停止します。",
  },
  {
    key: "seat",
    title: "席確認ボタン",
    desc: "配置変更中に席確認を隠す想定です。",
  },
  {
    key: "order",
    title: "会場オーダーボタン",
    desc: "飲食提供が止まった場合のブロックです。",
  },
];

const ORDER_ITEMS = ["水", "お茶", "コーヒー", "軽食"];
const AGENDA_ITEMS = [
  { time: "17:00", title: "受付開始" },
  { time: "17:45", title: "開場" },
  { time: "18:00", title: "開会" },
  { time: "18:15", title: "歓談" },
  { time: "19:00", title: "アトラクション" },
  { time: "20:00", title: "閉会" },
];
const FOOD_ITEMS = [
  { title: "前菜盛合せ", desc: "季節野菜と冷菜のサンプルメニュー" },
  { title: "魚料理", desc: "白身魚の蒸し物" },
  { title: "肉料理", desc: "ローストビーフと温野菜" },
  { title: "デザート", desc: "フルーツと小菓子" },
];
const DRINK_ITEMS = [
  { title: "ビール", desc: "アルコール" },
  { title: "ワイン", desc: "アルコール" },
  { title: "お茶", desc: "ソフトドリンク" },
  { title: "オレンジジュース", desc: "ソフトドリンク" },
];

let selectedGroupId = "group-a";
let selectedGuestId = null;
let selectedOrder = "";
let onsiteScreen = "home";
let attendeeFilter = "";
let phoneNotice = "";

function makeGuestId(groupId, index) {
  return `${groupId}-${index}`;
}

function defaultGuests() {
  const guests = {};
  GROUPS.forEach((group) => {
    group.seats.forEach((seat, index) => {
      const id = makeGuestId(group.id, index);
      guests[id] = {
        id,
        groupId: group.id,
        name: `来場者${String.fromCharCode(65 + index)}`,
        title: index === 0 ? "代表" : "参加者",
        table: seat.table,
        seat: seat.seat,
      };
    });
  });
  return guests;
}

function defaultState() {
  return {
    guests: defaultGuests(),
    canceled: {},
    checkedIn: {},
    blocked: {
      checkin: false,
      seat: false,
      order: false,
    },
    checkinOpen: true,
    orders: [],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState();
  } catch (_) {
    return defaultState();
  }
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function icon(name, className = "phone-icon") {
  return `<span class="${className} icon-${esc(name)}" aria-hidden="true"></span>`;
}

function groupById(groupId) {
  return GROUPS.find((group) => group.id === groupId) || GROUPS[0];
}

function guestList() {
  return Object.values(state.guests).sort((a, b) => {
    const table = String(a.table).localeCompare(String(b.table), "ja", { numeric: true });
    return table || Number(a.seat) - Number(b.seat);
  });
}

function isCanceled(id) {
  return Boolean(state.canceled[id]);
}

function isCheckedIn(id) {
  return Boolean(state.checkedIn[id]);
}

function activeGuests() {
  return guestList().filter((guest) => !isCanceled(guest.id));
}

function guestStatus(guest) {
  if (isCanceled(guest.id)) return { text: "キャンセル", key: "canceled" };
  if (isCheckedIn(guest.id)) return { text: "受付済", key: "checked" };
  return { text: "未受付", key: "waiting" };
}

function guestInitial(guest) {
  return (guest.name || "来").trim().slice(0, 1);
}

function setView(view) {
  document.querySelectorAll(".switch-btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
  document.querySelectorAll(".view-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === `view-${view}`);
  });
  renderAll();
}

function readInitialView() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  const phone = params.get("phone");
  if (["home", "agenda", "member", "venue", "food", "drink", "checkin"].includes(phone)) {
    onsiteScreen = phone;
  }
  return ["reception", "maintenance", "onsite"].includes(view) ? view : "reception";
}

function renderMetrics() {
  const guests = guestList();
  const canceledCount = guests.filter((guest) => isCanceled(guest.id)).length;
  const checkedCount = guests.filter((guest) => isCheckedIn(guest.id) && !isCanceled(guest.id)).length;
  const blockedCount = Object.values(state.blocked).filter(Boolean).length;
  document.getElementById("heroCount").textContent = guests.length;
  document.getElementById("metricExpected").textContent = guests.length - canceledCount;
  document.getElementById("metricCheckedIn").textContent = checkedCount;
  document.getElementById("metricCanceled").textContent = canceledCount;
  document.getElementById("metricBlocked").textContent = blockedCount;
}

function renderGroups() {
  const groupListEl = document.getElementById("groupList");
  groupListEl.innerHTML = GROUPS.map((group) => {
    const groupGuests = guestList().filter((guest) => guest.groupId === group.id);
    const canceled = groupGuests.filter((guest) => isCanceled(guest.id)).length;
    return `
      <button class="group-btn${group.id === selectedGroupId ? " is-active" : ""}" type="button" data-group-id="${esc(group.id)}">
        <span>
          <strong>${esc(group.name)}</strong>
          <small>${esc(group.note)} / ${groupGuests.length - canceled}名出席予定</small>
        </span>
        <span class="count-pill">${groupGuests.length}</span>
      </button>
    `;
  }).join("");

  groupListEl.querySelectorAll("[data-group-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedGroupId = button.dataset.groupId;
      renderAll();
    });
  });
}

function renderNameEditor() {
  const group = groupById(selectedGroupId);
  document.getElementById("receptionTitle").textContent = `${group.name} の出席者入力`;
  document.getElementById("nameEditor").innerHTML = group.seats.map((seat, index) => {
    const guest = state.guests[makeGuestId(group.id, index)];
    return `
      <div class="name-row">
        <span class="seat-badge">${esc(seat.table)}-${seat.seat}</span>
        <input type="text" value="${esc(guest.name)}" data-name-index="${index}" aria-label="${esc(seat.table)} ${seat.seat} 名前">
        <input type="text" value="${esc(guest.title)}" data-title-index="${index}" aria-label="${esc(seat.table)} ${seat.seat} メモ">
      </div>
    `;
  }).join("");
}

function saveNames() {
  const group = groupById(selectedGroupId);
  group.seats.forEach((seat, index) => {
    const name = document.querySelector(`[data-name-index="${index}"]`).value.trim() || `来場者${index + 1}`;
    const title = document.querySelector(`[data-title-index="${index}"]`).value.trim() || "参加者";
    const id = makeGuestId(group.id, index);
    state.guests[id] = {
      ...state.guests[id],
      name,
      title,
      table: seat.table,
      seat: seat.seat,
    };
  });
  saveState();
  renderAll();
}

function renderSeatMap(targetId) {
  const activeGroup = groupById(selectedGroupId);
  const ownedKeys = new Set(activeGroup.seats.map((seat) => `${seat.table}-${seat.seat}`));
  const checkedKeys = new Set(
    activeGuests()
      .filter((guest) => isCheckedIn(guest.id))
      .map((guest) => `${guest.table}-${guest.seat}`)
  );
  const namedKeys = new Set(
    activeGuests()
      .filter((guest) => guest.name)
      .map((guest) => `${guest.table}-${guest.seat}`)
  );
  const tableHtml = TABLES.map((table) => {
    const active = activeGroup.seats.some((seat) => seat.table === table.id);
    const seats = Array.from({ length: table.max }, (_, i) => {
      const seat = i + 1;
      const key = `${table.id}-${seat}`;
      let cls = "seat-dot";
      if (ownedKeys.has(key)) cls += " is-owned";
      if (namedKeys.has(key)) cls += " has-name";
      if (checkedKeys.has(key)) cls += " is-checked";
      return `<span class="${cls}">${seat}</span>`;
    }).join("");
    return `
      <div class="table-card${active ? " is-active" : ""}">
        <div class="table-title"><span>${esc(table.id)}</span><span>${esc(table.area)}</span></div>
        <div class="seat-dots">${seats}</div>
      </div>
    `;
  }).join("");
  document.getElementById(targetId).innerHTML = `
    <div class="map-stage">ステージ / 受付導線</div>
    <div class="map-grid">${tableHtml}</div>
  `;
}

function renderCancelList() {
  document.getElementById("cancelList").innerHTML = guestList().map((guest) => `
    <label class="maintenance-item">
      <span>
        <b>${esc(guest.name)}</b>
        <small>${esc(groupById(guest.groupId).name)} / ${esc(guest.table)}-${guest.seat}</small>
      </span>
      <span class="checkline">
        <input type="checkbox" data-cancel-id="${esc(guest.id)}" ${isCanceled(guest.id) ? "checked" : ""}>
        <span>キャンセル</span>
      </span>
    </label>
  `).join("");

  document.querySelectorAll("[data-cancel-id]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      state.canceled[checkbox.dataset.cancelId] = checkbox.checked;
      if (checkbox.checked) delete state.checkedIn[checkbox.dataset.cancelId];
      saveState();
      renderAll();
    });
  });
}

function renderFeatureToggles() {
  document.getElementById("featureToggles").innerHTML = FEATURE_LABELS.map((feature) => `
    <label class="toggle-item">
      <span>
        <b>${esc(feature.title)}</b>
        <small>${esc(feature.desc)}</small>
      </span>
      <span class="checkline">
        <input type="checkbox" data-feature-key="${esc(feature.key)}" ${state.blocked[feature.key] ? "checked" : ""}>
        <span>停止</span>
      </span>
    </label>
  `).join("");

  document.querySelectorAll("[data-feature-key]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      state.blocked[checkbox.dataset.featureKey] = checkbox.checked;
      saveState();
      renderAll();
    });
  });

  document.getElementById("checkinOpenToggle").checked = Boolean(state.checkinOpen);
}

function attendeeRowsHtml() {
  const keyword = attendeeFilter.trim().toLowerCase();
  const source = onsiteScreen === "member" ? guestList() : activeGuests();
  const rows = source.filter((guest) => {
    const group = groupById(guest.groupId).name;
    const text = `${guest.name} ${guest.title} ${group} ${guest.table}-${guest.seat}`.toLowerCase();
    return !keyword || text.includes(keyword);
  });

  if (!rows.length) {
    return `<div class="phone-empty">該当する来場者が見つかりません。</div>`;
  }

  return rows.map((guest) => {
    const group = groupById(guest.groupId);
    const status = guestStatus(guest);
    return `
      <button class="attendee-btn phone-attendee-btn${guest.id === selectedGuestId ? " is-active" : ""}${isCanceled(guest.id) ? " is-canceled" : ""}" type="button" data-guest-id="${esc(guest.id)}">
        <span class="phone-person-mark">${esc(guestInitial(guest))}</span>
        <span class="phone-person-copy">
          <strong>${esc(guest.name)}</strong>
          <small>${esc(group.name)} / ${esc(guest.title)} / ${esc(guest.table)}-${guest.seat}</small>
        </span>
        <span class="phone-status-chip is-${status.key}">${status.text}</span>
      </button>
    `;
  }).join("");
}

function bindAttendeeList(root) {
  root.querySelectorAll("[data-guest-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedGuestId = button.dataset.guestId;
      selectedOrder = "";
      phoneNotice = "";
      onsiteScreen = "guest";
      renderAll();
    });
  });
}

function renderOnsitePhone() {
  const screen = document.getElementById("onsitePhoneScreen");
  const back = document.getElementById("phoneBackBtn");
  back.classList.toggle("is-visible", onsiteScreen !== "home");

  if (onsiteScreen === "home") {
    const activeCount = activeGuests().length;
    const checkedCount = activeGuests().filter((guest) => isCheckedIn(guest.id)).length;
    const selected = selectedGuestId ? state.guests[selectedGuestId] : null;
    const selectedStatus = selected ? guestStatus(selected) : null;
    screen.innerHTML = `
      <section class="phone-home-hero">
        <span>本日の受付</span>
        <h2>出席受付アプリ</h2>
        <div class="phone-stat-row">
          <div><strong>${checkedCount}</strong><small>受付済</small></div>
          <div><strong>${activeCount}</strong><small>出席予定</small></div>
          <div><strong>${state.orders.length}</strong><small>オーダー</small></div>
        </div>
      </section>
      ${selected ? `
        <button class="phone-current-guest" type="button" data-phone-screen="guest">
          <span class="phone-person-mark">${esc(guestInitial(selected))}</span>
          <span>
            <small>確認中</small>
            <strong>${esc(selected.name)}</strong>
          </span>
          <span class="phone-status-chip is-${selectedStatus.key}">${selectedStatus.text}</span>
        </button>
      ` : ""}
      <div class="phone-home-grid">
        <button class="phone-home-btn" type="button" data-phone-screen="agenda">${icon("calendar-days")}<strong>次第</strong><small>進行を確認</small></button>
        <button class="phone-home-btn" type="button" data-phone-screen="member">${icon("users-round")}<strong>メンバー表</strong><small>席と状態を見る</small></button>
        <button class="phone-home-btn" type="button" data-phone-screen="venue" ${state.blocked.seat ? "disabled" : ""}>${icon("map")}<strong>会場図</strong><small>席配置を見る</small></button>
        <button class="phone-home-btn" type="button" data-phone-screen="food">${icon("utensils")}<strong>料理メニュー</strong></button>
        <button class="phone-home-btn" type="button" data-phone-screen="drink">${icon("cup-soda")}<strong>飲み物</strong></button>
        <button class="phone-home-btn is-primary" type="button" data-phone-screen="checkin" ${(!state.checkinOpen || state.blocked.checkin) ? "disabled" : ""}>${icon("badge-check")}<strong>チェックイン</strong><small>来場者を受付</small></button>
      </div>
    `;
    bindPhoneNav(screen);
    return;
  }

  if (onsiteScreen === "agenda") {
    screen.innerHTML = `
      <h2 class="phone-page-title">次第</h2>
      <p class="phone-page-sub">当日の進行をスマホで確認できます</p>
      <table class="phone-schedule">
        <thead><tr><th>時刻</th><th>プログラム</th></tr></thead>
        <tbody>${AGENDA_ITEMS.map((item) => `<tr><td class="phone-time">${esc(item.time)}</td><td>${esc(item.title)}</td></tr>`).join("")}</tbody>
      </table>
    `;
    return;
  }

  if (onsiteScreen === "venue") {
    const selected = selectedGuestId ? state.guests[selectedGuestId] : null;
    screen.innerHTML = `
      <h2 class="phone-page-title">会場図</h2>
      <p class="phone-page-sub">${selected ? `${esc(selected.name)} さんの席: ${esc(selected.table)}-${selected.seat}` : "テーブル配置を確認できます"}</p>
      <div class="phone-map">
        <div class="phone-map-inner">
          <div class="map-stage">ステージ</div>
          ${[0, 4].map((start) => `
            <div class="phone-map-row">
              ${TABLES.slice(start, start + 4).map((table) => `<span class="phone-map-table${selected && selected.table === table.id ? " is-highlighted" : ""}">${esc(table.id)}</span>`).join("")}
            </div>
          `).join("")}
        </div>
      </div>
      ${selected ? `<button class="phone-wide-action" type="button" data-phone-screen="guest">${esc(selected.name)} さんへ戻る</button>` : ""}
    `;
    bindPhoneNav(screen);
    return;
  }

  if (onsiteScreen === "food" || onsiteScreen === "drink") {
    const items = onsiteScreen === "food" ? FOOD_ITEMS : DRINK_ITEMS;
    screen.innerHTML = `
      <h2 class="phone-page-title">${onsiteScreen === "food" ? "料理メニュー" : "飲み物"}</h2>
      <div class="phone-menu-list">
        ${items.map((item) => `<div class="phone-menu-item"><strong>${esc(item.title)}</strong><span>${esc(item.desc)}</span></div>`).join("")}
      </div>
    `;
    return;
  }

  if (onsiteScreen === "guest") {
    const selected = selectedGuestId ? state.guests[selectedGuestId] : null;
    if (!selected) {
      screen.innerHTML = `
        <h2 class="phone-page-title">来場者詳細</h2>
        <div class="phone-empty">
          来場者を選択してください。
          <button class="phone-wide-action" type="button" data-phone-screen="checkin">来場者を探す</button>
        </div>
      `;
      bindPhoneNav(screen);
      return;
    }

    const group = groupById(selected.groupId);
    const status = guestStatus(selected);
    const canceled = isCanceled(selected.id);
    const checked = isCheckedIn(selected.id);
    const checkinDisabled = canceled || checked || !state.checkinOpen || state.blocked.checkin;
    const seatDisabled = state.blocked.seat;
    const orderDisabled = canceled || state.blocked.order;
    const latestOrder = state.orders.find((order) => order.guestId === selected.id);
    screen.innerHTML = `
      <section class="phone-guest-card">
        <div class="phone-guest-top">
          <span class="phone-person-mark is-large">${esc(guestInitial(selected))}</span>
          <span class="phone-status-chip is-${status.key}">${status.text}</span>
        </div>
        <h2>${esc(selected.name)}</h2>
        <p>${esc(group.name)} / ${esc(selected.title)}</p>
        <div class="phone-seat-ticket">
          <span>席番号</span>
          <strong>${esc(selected.table)}-${selected.seat}</strong>
        </div>
      </section>
      ${phoneNotice ? `<div class="phone-toast">${esc(phoneNotice)}</div>` : ""}
      ${latestOrder ? `<div class="phone-last-order">直近のオーダー: <strong>${esc(latestOrder.item)}</strong></div>` : ""}
      <div class="phone-action-stack">
        <button class="phone-main-action" type="button" id="phoneCheckinBtn" ${checkinDisabled ? "disabled" : ""}>${icon("badge-check", "phone-action-icon")}${checked ? "受付済み" : "出席登録する"}</button>
        <button class="phone-wide-action" type="button" data-phone-screen="venue" ${seatDisabled ? "disabled" : ""}>${icon("map", "phone-action-icon")}席を確認する</button>
        <button class="phone-wide-action" type="button" data-phone-screen="order" ${orderDisabled ? "disabled" : ""}>${icon("cup-soda", "phone-action-icon")}会場オーダーへ</button>
        <button class="phone-sub-action" type="button" data-phone-screen="checkin">${icon("users-round", "phone-action-icon")}来場者一覧へ戻る</button>
      </div>
    `;

    const checkinButton = screen.querySelector("#phoneCheckinBtn");
    checkinButton.addEventListener("click", () => {
      if (checkinDisabled) return;
      state.checkedIn[selected.id] = true;
      phoneNotice = `${selected.name} さんを受付済みにしました。`;
      saveState();
      renderAll();
    });
    bindPhoneNav(screen);
    return;
  }

  if (onsiteScreen === "order") {
    const selected = selectedGuestId ? state.guests[selectedGuestId] : null;
    if (!selected) {
      screen.innerHTML = `
        <h2 class="phone-page-title">会場オーダー</h2>
        <div class="phone-empty">
          先に来場者を選択してください。
          <button class="phone-wide-action" type="button" data-phone-screen="checkin">来場者を探す</button>
        </div>
      `;
      bindPhoneNav(screen);
      return;
    }

    screen.innerHTML = `
      <h2 class="phone-page-title">会場オーダー</h2>
      <p class="phone-page-sub">${esc(selected.name)} さんのオーダー</p>
      <div class="phone-order-grid">
        ${ORDER_ITEMS.map((item) => `
          <button class="order-item${selectedOrder === item ? " is-selected" : ""}" type="button" data-order-item="${esc(item)}">
            ${esc(item)}
          </button>
        `).join("")}
      </div>
      <button class="phone-main-action" type="button" id="phoneSendOrderBtn" ${(!selectedOrder || state.blocked.order || isCanceled(selected.id)) ? "disabled" : ""}>${icon("badge-check", "phone-action-icon")}オーダーを送信</button>
      ${phoneNotice ? `<div class="phone-toast">${esc(phoneNotice)}</div>` : `<p class="order-note">送信後の状態をスマホ画面上で確認できます。</p>`}
      <button class="phone-sub-action" type="button" data-phone-screen="guest">${icon("users-round", "phone-action-icon")}来場者詳細へ戻る</button>
    `;

    screen.querySelectorAll("[data-order-item]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedOrder = button.dataset.orderItem;
        phoneNotice = "";
        renderAll();
      });
    });
    screen.querySelector("#phoneSendOrderBtn").addEventListener("click", () => {
      if (!selectedOrder || state.blocked.order || isCanceled(selected.id)) return;
      state.orders.unshift({
        guestId: selected.id,
        item: selectedOrder,
        at: new Date().toISOString(),
      });
      phoneNotice = `${selected.name} さんの「${selectedOrder}」を受け付けました。`;
      selectedOrder = "";
      saveState();
      renderAll();
    });
    bindPhoneNav(screen);
    return;
  }

  screen.innerHTML = `
    <h2 class="phone-page-title">${onsiteScreen === "member" ? "メンバー表" : "チェックイン"}</h2>
    <p class="phone-page-sub">${onsiteScreen === "member" ? "来場者と席を確認できます" : "来場者を選んで出席登録します"}</p>
    <label class="search-label" for="attendeeSearch">来場者検索</label>
    <div class="phone-search-wrap">
      <input id="attendeeSearch" class="search-input" type="search" value="${esc(attendeeFilter)}" placeholder="氏名・団体・テーブルで検索" />
    </div>
    <div class="attendee-list" id="attendeeList">${attendeeRowsHtml()}</div>
  `;

  const search = screen.querySelector("#attendeeSearch");
  search.addEventListener("input", () => {
    attendeeFilter = search.value;
    screen.querySelector("#attendeeList").innerHTML = attendeeRowsHtml();
    bindAttendeeList(screen);
  });
  bindAttendeeList(screen);
}

function bindPhoneNav(root) {
  root.querySelectorAll("[data-phone-screen]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      onsiteScreen = button.dataset.phoneScreen;
      if (onsiteScreen !== "order") selectedOrder = "";
      phoneNotice = "";
      renderAll();
    });
  });
}

function renderAll() {
  renderMetrics();
  renderGroups();
  renderNameEditor();
  renderSeatMap("receptionSeatMap");
  renderCancelList();
  renderFeatureToggles();
  renderOnsitePhone();
}

document.querySelectorAll(".switch-btn").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.getElementById("saveNamesBtn").addEventListener("click", saveNames);
document.getElementById("resetNamesBtn").addEventListener("click", () => {
  state.guests = defaultGuests();
  saveState();
  renderAll();
});
document.getElementById("checkinOpenToggle").addEventListener("change", (event) => {
  state.checkinOpen = event.target.checked;
  saveState();
  renderAll();
});
document.getElementById("clearCheckinsBtn").addEventListener("click", () => {
  state.checkedIn = {};
  saveState();
  renderAll();
});
document.getElementById("restoreAllBtn").addEventListener("click", () => {
  state = defaultState();
  selectedGroupId = "group-a";
  selectedGuestId = null;
  selectedOrder = "";
  onsiteScreen = "home";
  attendeeFilter = "";
  phoneNotice = "";
  saveState();
  renderAll();
});
document.getElementById("phoneBackBtn").addEventListener("click", () => {
  onsiteScreen = "home";
  selectedOrder = "";
  phoneNotice = "";
  renderAll();
});

setView(readInitialView());
