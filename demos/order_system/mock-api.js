(() => {
  const STORAGE_KEY = 'sample-order-portal-web-sample-v1';
  const LATENCY_MS = 180;
  const SCRIPT_BASE_URL = (() => {
    const scriptUrl = document.currentScript && document.currentScript.src;
    return scriptUrl
      ? new URL('.', scriptUrl)
      : new URL('/demos/order_system/', window.location.origin);
  })();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function padSeq(value) {
    return String(value).padStart(3, '0');
  }

  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function orderSystemUrl(file) {
    return new URL(file, SCRIPT_BASE_URL).pathname;
  }

  function siteRootUrl() {
    const marker = '/demos/order_system/';
    const path = SCRIPT_BASE_URL.pathname;
    const index = path.indexOf(marker);
    return index >= 0 ? path.slice(0, index + 1) : '/';
  }

  function documentUrl(type, id) {
    return orderSystemUrl('sample_document.html') +
      '?type=' + encodeURIComponent(type) +
      '&id=' + encodeURIComponent(id);
  }

  function initialState() {
    const masters = {
      crops: ['商品A', '商品B', '商品C', '商品D', '商品E'],
      bases: ['サンプルチームA', 'サンプルチームB', 'サンプルチームC'],
      staff: ['サンプル担当A', 'サンプル担当B', 'サンプル担当C', 'サンプル担当D'],
      carriers: ['サンプル連携A', 'サンプル連携B', 'サンプル連携C'],
      cars: ['軽トラック', 'ハイエース', '2tトラック'],
      clients: ['サンプル会社A', 'サンプル会社B', 'サンプル会社C', 'サンプル会社D'],
      prices: [
        { crop: '商品A', unitPrice: 33000, note: '標準プラン' },
        { crop: '商品B', unitPrice: 27500, note: '基本パッケージ' },
        { crop: '商品C', unitPrice: 38500, note: 'イベント向け' },
        { crop: '商品D', unitPrice: 30800, note: '短期利用向け' },
        { crop: '商品E', unitPrice: 35200, note: '大型案件向け' }
      ],
      costs: [
        { crop: '商品A', unitCost: 110, note: '標準コスト' },
        { crop: '商品B', unitCost: 82, note: '標準コスト' },
        { crop: '商品C', unitCost: 125, note: '高条件プラン' },
        { crop: '商品D', unitCost: 94, note: '標準コスト' },
        { crop: '商品E', unitCost: 118, note: '大型案件コスト' }
      ],
      partners: [
        {
          company: 'サンプル会社A',
          contact: 'サンプル担当A',
          email: 'demo-a@example.invalid'
        },
        {
          company: 'サンプル会社B',
          contact: 'サンプル担当B',
          email: 'demo-b@example.invalid'
        },
        {
          company: 'サンプル会社C',
          contact: 'サンプル担当C',
          email: 'demo-c@example.invalid'
        }
      ]
    };

    const orders = [
      makeOrder(masters, {
        id: 'OP-202604-001',
        submittedBy: 'サンプル会社A',
        clientName: 'サンプル案件A',
        address: 'サンプル県サンプル市中央1-1-1',
        base: 'サンプルチームA',
        client: 'サンプルチームA_サンプル会社A',
        crop: '商品A',
        style: 'レンタル',
        qty: 8,
        pieces: 128,
        eventDate: '2026-05-09',
        loadDate: '2026-05-08',
        returnDate: '2026-05-10',
        loadTime: '15:00',
        unloadTime: '17:00',
        loadPlace: 'サンプルチームA',
        unloadPlace: 'サンプル案件A 搬入口',
        carrier: 'サンプル連携A',
        car: 'ハイエース',
        staff: 'サンプル担当A',
        rentHandler: 'サンプル担当B',
        orderFileUrl: documentUrl('order', 'OP-202604-001'),
        deliveryFileUrl: documentUrl('delivery', 'OP-202604-001'),
        deliverySentAt: '2026-04-18',
        status: '有効',
        note: '搬入口で受け渡し。予備品を少し多めに。'
      }),
      makeOrder(masters, {
        id: 'OP-202604-002',
        submittedBy: 'サンプル会社B',
        clientName: 'サンプルイベント会場B',
        address: 'サンプル県サンプル市港2-2-2',
        base: '',
        client: '',
        crop: '商品B',
        style: 'イベント',
        qty: 14,
        pieces: 210,
        eventDate: '2026-05-18',
        loadDate: '2026-05-17',
        returnDate: '2026-05-19',
        loadTime: '14:30',
        unloadTime: '16:30',
        loadPlace: '',
        unloadPlace: 'サンプルイベント会場B 西ゲート',
        carrier: '',
        car: '',
        staff: 'サンプル担当C',
        rentHandler: '',
        orderFileUrl: '',
        deliveryFileUrl: '',
        deliverySentAt: '',
        status: 'チーム未決定',
        note: '雨天時は屋内通路へ移動予定。'
      }),
      makeOrder(masters, {
        id: 'OP-202604-003',
        submittedBy: 'サンプル会社A',
        clientName: 'サンプル案件C',
        address: 'サンプル県サンプル市東3-3-3',
        base: 'サンプルチームC',
        client: 'サンプルチームC_サンプル会社A',
        crop: '商品C',
        style: '公開',
        qty: 12,
        pieces: 180,
        eventDate: '2026-06-02',
        loadDate: '2026-06-01',
        returnDate: '2026-06-03',
        loadTime: '13:00',
        unloadTime: '16:00',
        loadPlace: 'サンプルチームC',
        unloadPlace: 'サンプル案件C 搬入口',
        carrier: 'サンプル連携B',
        car: '2tトラック',
        staff: 'サンプル担当D',
        rentHandler: 'サンプル担当A',
        orderFileUrl: documentUrl('order', 'OP-202604-003'),
        deliveryFileUrl: '',
        deliverySentAt: '',
        status: '有効',
        note: '確認用に状態のよいものを選定。'
      }),
      makeOrder(masters, {
        id: 'OP-202604-004',
        submittedBy: 'サンプル会社C',
        clientName: 'サンプル案件D',
        address: 'サンプル県サンプル市南4-4-4',
        base: 'サンプルチームB',
        client: 'サンプルチームB_サンプル会社C',
        crop: '商品D',
        style: 'レンタル',
        qty: 5,
        pieces: 80,
        eventDate: '2026-05-25',
        loadDate: '2026-05-24',
        returnDate: '2026-05-26',
        loadTime: '09:00',
        unloadTime: '11:00',
        loadPlace: 'サンプルチームB',
        unloadPlace: 'サンプル案件D 搬入口',
        carrier: 'サンプル連携A',
        car: '軽トラック',
        staff: 'サンプル担当B',
        rentHandler: '',
        orderFileUrl: documentUrl('order', 'OP-202604-004'),
        deliveryFileUrl: documentUrl('delivery', 'OP-202604-004'),
        deliverySentAt: '2026-04-20',
        status: '有効',
        note: '利用者が触れるため固定具を追加。'
      })
    ];

    return {
      masters,
      orders,
      dailyExpenses: {
        'OP-202604-001': {
          personnel: 22000,
          transport: 9000,
          fuel: 3800,
          rental: 0,
          misc: 1600
        },
        'OP-202604-004': {
          personnel: 18000,
          transport: 7400,
          fuel: 2600,
          rental: 0,
          misc: 900
        }
      },
      nextSeq: 5
    };
  }

  function makeOrder(masters, input) {
    const crop = input.crop || '';
    const unitPrice = priceFor({ masters }, crop);
    const unitCost = costFor({ masters }, crop);
    const qty = Number(input.qty) || 0;
    const pieces = Number(input.pieces) || qty * 15;
    return {
      submittedAt: today(),
      submittedBy: '',
      clientName: '',
      address: '',
      client: '',
      base: '',
      crop: '',
      style: 'レンタル',
      qty: 0,
      pieces: 0,
      unitPrice,
      unitCost,
      amount: Math.round(qty * unitPrice),
      cost: Math.round(pieces * unitCost),
      eventDate: '',
      loadDate: '',
      returnDate: '',
      loadTime: '15:00',
      unloadTime: '17:00',
      loadPlace: '',
      unloadPlace: '',
      carrier: '',
      car: '',
      staff: '',
      rentHandler: '',
      orderFileUrl: '',
      deliveryFileUrl: '',
      deliverySentAt: '',
      status: input.base ? '有効' : 'チーム未決定',
      note: '',
      ...input,
      unitPrice,
      unitCost,
      qty,
      pieces,
      amount: Math.round(qty * unitPrice),
      cost: Math.round(pieces * unitCost)
    };
  }

  function getState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (error) {
      window.__MOBILE_ORCHARD_SAMPLE_STATE__ = window.__MOBILE_ORCHARD_SAMPLE_STATE__ || initialState();
      return window.__MOBILE_ORCHARD_SAMPLE_STATE__;
    }
    const state = initialState();
    saveState(state);
    return state;
  }

  function saveState(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      window.__MOBILE_ORCHARD_SAMPLE_STATE__ = state;
    }
  }

  function priceFor(state, crop) {
    const row = (state.masters.prices || []).find(item => item.crop === crop);
    return row ? Number(row.unitPrice) || 0 : 0;
  }

  function costFor(state, crop) {
    const row = (state.masters.costs || []).find(item => item.crop === crop);
    return row ? Number(row.unitCost) || 0 : 0;
  }

  function recalcOrder(state, order) {
    order.unitPrice = priceFor(state, order.crop);
    order.unitCost = costFor(state, order.crop);
    order.qty = Number(order.qty) || 0;
    order.pieces = Number(order.pieces) || order.qty * 15;
    order.amount = Math.round(order.qty * order.unitPrice);
    order.cost = Math.round(order.pieces * order.unitCost);
    if (!String(order.base || '').trim() && order.status !== 'キャンセル') {
      order.status = 'チーム未決定';
      order.client = '';
    } else if (!order.client) {
      order.client = order.base + '_サンプル会社A';
      if (order.status === 'チーム未決定') order.status = '有効';
    }
    return order;
  }

  function metaFor(state) {
    return {
      appVersion: 'WEB_SAMPLE_2026-04-23',
      spreadsheet: {
        name: 'ローカルサンプルDB',
        id: 'browser-localStorage'
      },
      '依頼DB': {
        exists: true,
        lastRow: state.orders.length + 1
      },
      '日計DB': {
        exists: true,
        lastRow: Object.keys(state.dailyExpenses || {}).length + 1
      },
      '総表': {
        exists: true,
        lastRow: state.orders.length + 1
      }
    };
  }

  function findOrder(state, orderId) {
    const order = state.orders.find(item => item.id === orderId);
    if (!order) throw new Error('依頼が見つかりません: ' + orderId);
    return order;
  }

  function partnerForEmail(state, email) {
    const normalized = String(email || '').trim().toLowerCase();
    return (state.masters.partners || []).find(partner =>
      String(partner.email || '').toLowerCase() === normalized
    );
  }

  function partnerForCompany(state, company) {
    const normalized = String(company || '').trim();
    return (state.masters.partners || []).find(partner => partner.company === normalized);
  }

  const api = {
    getPublicMasters(password) {
      const state = getState();
      return {
        ok: true,
        data: clone({
          crops: state.masters.crops,
          prices: state.masters.prices
        })
      };
    },

    getMasters(password, mode) {
      const state = getState();
      return {
        ok: true,
        data: clone(state.masters)
      };
    },

    submitOrder(password, payload) {
      const state = getState();
      const id = 'OP-202604-' + padSeq(state.nextSeq || state.orders.length + 1);
      state.nextSeq = (state.nextSeq || state.orders.length + 1) + 1;
      const order = makeOrder(state.masters, {
        id,
        submittedBy: payload.submittedBy,
        clientName: payload.clientName,
        address: payload.address,
        crop: payload.crop,
        style: payload.style,
        qty: payload.qty,
        pieces: payload.pieces,
        eventDate: payload.eventDate,
        loadDate: payload.loadDate,
        returnDate: payload.returnDate,
        loadTime: payload.loadTime,
        unloadTime: payload.unloadTime,
        unloadPlace: payload.unloadPlace,
        note: payload.note,
        orderFileUrl: documentUrl('order', id),
        status: 'チーム未決定'
      });
      state.orders.unshift(order);
      saveState(state);
      return {
        ok: true,
        orderId: id,
        pdfUrl: order.orderFileUrl
      };
    },

    listOrders(password) {
      const state = getState();
      return {
        ok: true,
        data: clone(state.orders),
        meta: metaFor(state)
      };
    },

    assignBase(password, orderId, base, clientType) {
      const state = getState();
      const order = findOrder(state, orderId);
      order.base = base;
      order.client = base + '_' + (clientType || 'サンプル会社A');
      order.loadPlace = base;
      order.status = '有効';
      recalcOrder(state, order);
      saveState(state);
      return {
        ok: true,
        data: clone(order)
      };
    },

    updateOrder(password, orderId, payload) {
      const state = getState();
      const order = findOrder(state, orderId);
      Object.assign(order, payload);
      recalcOrder(state, order);
      saveState(state);
      return {
        ok: true,
        data: clone(order)
      };
    },

    deleteOrder(password, orderId) {
      const state = getState();
      state.orders = state.orders.filter(order => order.id !== orderId);
      delete state.dailyExpenses[orderId];
      saveState(state);
      return {
        ok: true
      };
    },

    updatePriceMaster(password, rows) {
      const state = getState();
      state.masters.prices = rows.map(row => ({
        crop: row.crop,
        unitPrice: Number(row.unitPrice) || 0,
        note: row.note || ''
      }));
      state.masters.crops = Array.from(new Set([
        ...state.masters.crops,
        ...state.masters.prices.map(row => row.crop)
      ].filter(Boolean)));
      saveState(state);
      return {
        ok: true
      };
    },

    updateCostMaster(password, rows) {
      const state = getState();
      state.masters.costs = rows.map(row => ({
        crop: row.crop,
        unitCost: Number(row.unitCost) || 0,
        note: row.note || ''
      }));
      state.masters.crops = Array.from(new Set([
        ...state.masters.crops,
        ...state.masters.costs.map(row => row.crop)
      ].filter(Boolean)));
      saveState(state);
      return {
        ok: true
      };
    },

    recalcAllOrders(password) {
      const state = getState();
      state.orders.forEach(order => recalcOrder(state, order));
      saveState(state);
      return {
        ok: true,
        updated: state.orders.length
      };
    },

    getDailyExpenses(password, orderId) {
      const state = getState();
      return {
        ok: true,
        data: clone(state.dailyExpenses[orderId] || {
          personnel: 0,
          transport: 0,
          fuel: 0,
          rental: 0,
          misc: 0
        })
      };
    },

    updateDailyExpenses(password, orderId, exp) {
      const state = getState();
      state.dailyExpenses[orderId] = {
        personnel: Number(exp.personnel) || 0,
        transport: Number(exp.transport) || 0,
        fuel: Number(exp.fuel) || 0,
        rental: Number(exp.rental) || 0,
        misc: Number(exp.misc) || 0
      };
      saveState(state);
      return {
        ok: true
      };
    },

    getPartnerEmail(password, companyName) {
      const state = getState();
      const partner = partnerForCompany(state, companyName);
      return {
        ok: true,
        email: partner ? partner.email : 'demo-a@example.invalid'
      };
    },

    sendDeliveryNote(password, orderId, toAddress, ccAddress, subject, bodyText) {
      const state = getState();
      const order = findOrder(state, orderId);
      order.deliverySentAt = today();
      order.deliveryFileUrl = documentUrl('delivery', orderId);
      saveState(state);
      return {
        ok: true,
        sentTo: toAddress,
        fileUrl: order.deliveryFileUrl
      };
    },

    getPartnerHistory(password, email) {
      const state = getState();
      const partner = partnerForEmail(state, email) || {
        company: 'サンプル会社A',
        contact: 'サンプル担当',
        email
      };
      const data = state.orders.filter(order =>
        order.submittedBy === partner.company || !partnerForEmail(state, email)
      );
      return {
        ok: true,
        partner: clone(partner),
        data: clone(data)
      };
    }
  };

  function createRunner(context = {}) {
    return new Proxy({}, {
      get(target, prop) {
        if (prop === 'withSuccessHandler') {
          return handler => createRunner({ ...context, success: handler });
        }
        if (prop === 'withFailureHandler') {
          return handler => createRunner({ ...context, failure: handler });
        }
        if (prop === 'then') return undefined;
        return (...args) => {
          window.setTimeout(() => {
            try {
              if (!api[prop]) throw new Error('未実装のサンプルAPIです: ' + String(prop));
              const result = api[prop](...args);
              if (context.success) context.success(result);
            } catch (error) {
              if (context.failure) context.failure(error);
              else console.error(error);
            }
          }, LATENCY_MS);
          return createRunner();
        };
      }
    });
  }

  function addSampleChrome() {
    if (document.querySelector('.demo-chrome')) return;
    const style = document.createElement('style');
    style.textContent = `
      .demo-chrome {
        position: sticky;
        top: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-bottom: 1px solid rgba(20,33,29,.12);
        background: rgba(255,255,255,.92);
        backdrop-filter: blur(12px);
        color: #21342d;
        font: 700 12px/1.4 -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
      }
      .demo-chrome strong { margin-right: 4px; color: #174a37; }
      .demo-chrome a {
        width: auto;
        min-height: 0;
        margin: 0;
        padding: 6px 10px;
        border: 1px solid rgba(31,79,57,.18);
        border-radius: 999px;
        background: #fff;
        box-shadow: none;
        color: #174a37;
        font: inherit;
        letter-spacing: 0;
        text-decoration: none;
        cursor: pointer;
        transform: none;
      }
      .demo-chrome a:hover {
        background: #eef7ed;
        filter: none;
        transform: none;
        box-shadow: none;
      }
      .demo-login-hint {
        flex-basis: 100%;
        margin: 10px 0 12px;
        padding: 12px 14px;
        border: 1px solid rgba(29,78,216,.16);
        border-radius: 14px;
        background: rgba(219,234,254,.72);
        color: #1e3a5f;
        font: 700 13px/1.7 -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
      }
      .demo-login-hint-title {
        margin-bottom: 2px;
        color: #1d4ed8;
        font-weight: 800;
      }
      .demo-login-hint code {
        display: inline-block;
        margin-left: 4px;
        padding: 1px 7px;
        border-radius: 999px;
        background: #fff;
        color: #1d4ed8;
        font: 800 12px/1.6 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }
      .demo-login-button {
        width: auto !important;
        min-height: 34px !important;
        margin: 9px 0 0 !important;
        padding: 8px 13px !important;
        border: 0 !important;
        border-radius: 999px !important;
        background: #1d4ed8 !important;
        box-shadow: 0 8px 18px rgba(29,78,216,.18) !important;
        color: #fff !important;
        font: 800 13px/1.2 -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif !important;
        letter-spacing: 0 !important;
        cursor: pointer;
      }
      .demo-login-button:hover {
        background: #1e40af !important;
        filter: none !important;
        transform: translateY(-1px) !important;
      }
      @media (max-width: 640px) {
        .demo-chrome { overflow-x: auto; white-space: nowrap; }
      }
    `;
    document.head.appendChild(style);

    const nav = document.createElement('nav');
    nav.className = 'demo-chrome';
    nav.innerHTML = `
      <strong>WEBサンプル</strong>
      <a href="${orderSystemUrl('00_hub.html')}">ハブ</a>
      <a href="${orderSystemUrl('04_index.html')}">入力</a>
      <a href="${orderSystemUrl('05_admin.html')}">管理者</a>
      <a href="${orderSystemUrl('06_history.html')}">履歴</a>
    `;
    document.body.prepend(nav);
  }

  function addDemoLoginHint() {
    const loginBox = document.getElementById('loginBox');
    if (!loginBox || loginBox.querySelector('.demo-login-hint')) return;
    const hasEmail = Boolean(document.getElementById('email'));
    const loginButton = loginBox.querySelector('button');
    const hint = document.createElement('div');
    hint.className = 'demo-login-hint';
    hint.innerHTML = `
      <div class="demo-login-hint-title">デモ用ログイン情報</div>
      <div>パスワード:<code>demo</code></div>
      ${hasEmail ? '<div>履歴メール:<code>demo-a@example.invalid</code></div>' : ''}
      <button class="demo-login-button" type="button">デモでログイン</button>
    `;
    const demoButton = hint.querySelector('.demo-login-button');
    demoButton.addEventListener('click', () => {
      const pw = document.getElementById('pw');
      if (pw) pw.value = 'demo';
      const email = document.getElementById('email');
      if (email) email.value = 'demo-a@example.invalid';
      if (loginButton) loginButton.click();
    });
    if (loginButton) {
      loginBox.insertBefore(hint, loginButton);
    } else {
      loginBox.appendChild(hint);
    }
  }

  function fillSampleLogin() {
    const pw = document.getElementById('pw');
    if (pw && !pw.value) pw.value = 'demo';
    const email = document.getElementById('email');
    if (email && !email.value) email.value = 'demo-a@example.invalid';
  }

  function applyDemoLinks() {
    document.querySelectorAll('[data-order-file]').forEach(link => {
      link.href = orderSystemUrl(link.getAttribute('data-order-file'));
    });
    document.querySelectorAll('[data-site-root]').forEach(link => {
      link.href = siteRootUrl();
    });
  }

  window.google = window.google || {};
  window.google.script = window.google.script || {};
  window.google.script.run = createRunner();

  window.SampleOrderMock = {
    state: getState,
    api
  };

  document.addEventListener('DOMContentLoaded', () => {
    getState();
    addSampleChrome();
    addDemoLoginHint();
    fillSampleLogin();
    applyDemoLinks();
  });
})();
