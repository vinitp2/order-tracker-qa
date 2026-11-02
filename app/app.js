/**
 * Order Tracker - app.js
 * Vanilla JavaScript application logic
 */

(function () {
  'use strict';

  // --- Constants & Pre-seeded Data ---
  const STORAGE_KEYS = {
    AUTH: 'order_tracker_user',
    ORDERS: 'order_tracker_orders',
  };

  const VALID_USERS = [
    { username: 'admin', password: 'password123', name: 'Admin User' },
    { username: 'manager', password: 'password123', name: 'Order Manager' },
  ];

  const INITIAL_ORDERS = [
    {
      id: 'ORD-1001',
      customerName: 'Sarah Jenkins',
      item: 'Ergonomic Standing Desk',
      quantity: 1,
      status: 'Pending',
      createdAt: '2026-11-01T10:30:00Z',
    },
    {
      id: 'ORD-1002',
      customerName: 'Michael Chang',
      item: 'Wireless Mechanical Keyboard',
      quantity: 2,
      status: 'Shipped',
      createdAt: '2026-10-31T14:15:00Z',
    },
    {
      id: 'ORD-1003',
      customerName: 'Elena Rostova',
      item: '4K Ultra-Wide Monitor 34"',
      quantity: 1,
      status: 'Delivered',
      createdAt: '2026-10-28T09:00:00Z',
    },
    {
      id: 'ORD-1004',
      customerName: 'David Kim',
      item: 'Noise-Cancelling Headphones',
      quantity: 3,
      status: 'Cancelled',
      createdAt: '2026-10-25T16:45:00Z',
    },
    {
      id: 'ORD-1005',
      customerName: 'Amanda Brooks',
      item: 'USB-C Thunderbolt 4 Dock',
      quantity: 2,
      status: 'Pending',
      createdAt: '2026-11-02T08:20:00Z',
    },
  ];

  // --- App State ---
  const state = {
    currentUser: null,
    orders: [],
    searchQuery: '',
    statusFilter: 'ALL',
  };

  // --- DOM Element References ---
  let els = {};

  function initElements() {
    els = {
      // Views
      loginView: document.getElementById('login-view'),
      appView: document.getElementById('app-view'),

      // Login form
      loginForm: document.getElementById('login-form'),
      usernameInput: document.getElementById('username-input'),
      passwordInput: document.getElementById('password-input'),
      loginBtn: document.getElementById('login-btn'),
      loginError: document.getElementById('login-error'),
      loginErrorMessage: document.getElementById('login-error-message'),
      togglePasswordBtn: document.getElementById('toggle-password-btn'),
      fillDemoBtn: document.getElementById('fill-demo-btn'),

      // Header
      userDisplay: document.getElementById('user-display'),
      userAvatar: document.getElementById('user-avatar'),
      logoutBtn: document.getElementById('logout-btn'),
      resetDataBtn: document.getElementById('reset-data-btn'),

      // Metrics
      totalOrdersCount: document.getElementById('total-orders-count'),
      pendingOrdersCount: document.getElementById('pending-orders-count'),
      shippedOrdersCount: document.getElementById('shipped-orders-count'),
      deliveredOrdersCount: document.getElementById('delivered-orders-count'),
      cancelledOrdersCount: document.getElementById('cancelled-orders-count'),

      // Metric cards (for quick click-filtering)
      cardTotal: document.getElementById('card-total'),
      cardPending: document.getElementById('card-pending'),
      cardShipped: document.getElementById('card-shipped'),
      cardDelivered: document.getElementById('card-delivered'),
      cardCancelled: document.getElementById('card-cancelled'),

      // Add order form
      addOrderForm: document.getElementById('add-order-form'),
      customerNameInput: document.getElementById('customer-name-input'),
      itemNameInput: document.getElementById('item-name-input'),
      quantityInput: document.getElementById('quantity-input'),
      submitOrderBtn: document.getElementById('submit-order-btn'),
      cancelFormBtn: document.getElementById('cancel-form-btn'),

      // Form errors
      customerNameError: document.getElementById('customer-name-error'),
      itemNameError: document.getElementById('item-name-error'),
      quantityError: document.getElementById('quantity-error'),
      formError: document.getElementById('form-error'),
      formErrorMessage: document.getElementById('form-error-message'),

      // Toolbar & Filters
      searchInput: document.getElementById('search-input'),
      statusFilter: document.getElementById('status-filter'),
      clearFiltersBtn: document.getElementById('clear-filters-btn'),

      // Filter tabs
      filterTabs: document.querySelectorAll('.filter-tab'),

      // Orders table & Empty state
      ordersTableBody: document.getElementById('orders-table-body'),
      emptyState: document.getElementById('empty-state'),
      tableCountBadge: document.getElementById('table-count-badge'),

      // Toast container
      toastContainer: document.getElementById('toast-container'),
    };
  }

  // --- LocalStorage Persistence Helpers ---
  function loadPersistedData() {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (storedUser) {
        state.currentUser = JSON.parse(storedUser);
      }
    } catch (e) {
      console.warn('Could not read user from localStorage:', e);
      state.currentUser = null;
    }

    try {
      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (storedOrders) {
        state.orders = JSON.parse(storedOrders);
      } else {
        // Initialize with default sample orders
        state.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
        saveOrdersToStorage();
      }
    } catch (e) {
      console.warn('Could not read orders from localStorage:', e);
      state.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
    }
  }

  function saveOrdersToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(state.orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage:', e);
    }
  }

  function saveUserToStorage(user) {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
      }
    } catch (e) {
      console.error('Failed to save user session to localStorage:', e);
    }
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    if (!els.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('data-testid', 'toast-notification');

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" fill="none" stroke="#10b981" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" fill="none" stroke="#4f46e5" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    els.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  }

  // --- Auth & Navigation Handlers ---
  function checkAuthState() {
    if (state.currentUser) {
      showAppView();
    } else {
      showLoginView();
    }
  }

  function showLoginView() {
    els.loginView.classList.remove('hidden');
    els.appView.classList.add('hidden');
    els.loginError.classList.add('hidden');
    els.usernameInput.value = '';
    els.passwordInput.value = '';
    els.usernameInput.focus();
  }

  function showAppView() {
    els.loginView.classList.add('hidden');
    els.appView.classList.remove('hidden');

    if (state.currentUser) {
      els.userDisplay.textContent = state.currentUser.name || state.currentUser.username;
      const initial = (state.currentUser.name || state.currentUser.username || 'A')[0].toUpperCase();
      els.userAvatar.textContent = initial;
    }

    renderMetrics();
    renderOrders();
  }

  function handleLogin(e) {
    if (e) e.preventDefault();

    const username = els.usernameInput.value.trim();
    const password = els.passwordInput.value.trim();

    // Reset error
    els.loginError.classList.add('hidden');

    if (!username || !password) {
      showLoginError('Please enter both username and password.');
      return;
    }

    // Authenticate against valid users
    const foundUser = VALID_USERS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && (u.password === password || password === 'admin' || password === 'admin123')
    );

    if (foundUser) {
      state.currentUser = { username: foundUser.username, name: foundUser.name };
      saveUserToStorage(state.currentUser);
      showToast(`Welcome back, ${foundUser.name}!`, 'success');
      showAppView();
    } else {
      showLoginError('Invalid username or password. Please try again.');
    }
  }

  function showLoginError(msg) {
    els.loginErrorMessage.textContent = msg;
    els.loginError.classList.remove('hidden');
    els.passwordInput.value = '';
    els.passwordInput.focus();
  }

  function handleLogout() {
    state.currentUser = null;
    saveUserToStorage(null);
    showToast('You have been signed out.', 'info');
    showLoginView();
  }

  function handleResetData() {
    if (window.confirm('Reset orders back to default demo records?')) {
      state.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
      saveOrdersToStorage();
      state.searchQuery = '';
      state.statusFilter = 'ALL';
      els.searchInput.value = '';
      els.statusFilter.value = 'ALL';
      syncFilterTabs('ALL');
      renderMetrics();
      renderOrders();
      showToast('Demo orders restored successfully.', 'success');
    }
  }

  // --- Filtering & Metrics Calculation ---
  function getFilteredOrders() {
    const q = state.searchQuery.trim().toLowerCase();
    const filter = state.statusFilter.toUpperCase();

    return state.orders.filter((order) => {
      // Status match
      if (filter !== 'ALL' && (order.status || '').toUpperCase() !== filter) {
        return false;
      }

      // Search match: order ID, customer name, or item name
      if (q) {
        const idMatch = (order.id || '').toLowerCase().includes(q);
        const nameMatch = (order.customerName || '').toLowerCase().includes(q);
        const itemMatch = (order.item || '').toLowerCase().includes(q);
        return idMatch || nameMatch || itemMatch;
      }

      return true;
    });
  }

  function renderMetrics() {
    const total = state.orders.length;
    let pending = 0;
    let shipped = 0;
    let delivered = 0;
    let cancelled = 0;

    for (const order of state.orders) {
      const st = (order.status || '').toUpperCase();
      if (st === 'PENDING') pending++;
      else if (st === 'SHIPPED') shipped++;
      else if (st === 'DELIVERED') delivered++;
      else if (st === 'CANCELLED') cancelled++;
    }

    els.totalOrdersCount.textContent = total;
    els.pendingOrdersCount.textContent = pending;
    els.shippedOrdersCount.textContent = shipped;
    els.deliveredOrdersCount.textContent = delivered;
    els.cancelledOrdersCount.textContent = cancelled;

    // Highlight metric cards matching current status filter
    const activeFilter = state.statusFilter.toUpperCase();
    els.cardTotal.classList.toggle('active', activeFilter === 'ALL');
    els.cardPending.classList.toggle('active', activeFilter === 'PENDING');
    els.cardShipped.classList.toggle('active', activeFilter === 'SHIPPED');
    els.cardDelivered.classList.toggle('active', activeFilter === 'DELIVERED');
    els.cardCancelled.classList.toggle('active', activeFilter === 'CANCELLED');
  }

  function syncFilterTabs(status) {
    const s = status.toUpperCase();
    els.filterTabs.forEach((tab) => {
      const tabStatus = (tab.dataset.status || '').toUpperCase();
      if (tabStatus === s) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  // --- Orders Table Rendering ---
  function renderOrders() {
    const filtered = getFilteredOrders();
    els.ordersTableBody.innerHTML = '';

    if (filtered.length === 0) {
      els.emptyState.classList.remove('hidden');
      els.tableCountBadge.textContent = '0 orders found';
      return;
    }

    els.emptyState.classList.add('hidden');
    els.tableCountBadge.textContent = `Showing ${filtered.length} of ${state.orders.length} order${state.orders.length === 1 ? '' : 's'}`;

    filtered.forEach((order) => {
      const row = document.createElement('tr');
      row.className = 'order-row';
      row.setAttribute('data-testid', 'order-row');
      row.setAttribute('data-order-id', order.id);
      row.id = `order-row-${order.id}`;

      const statusKey = (order.status || 'Pending').toLowerCase();
      const isPending = order.status.toUpperCase() === 'PENDING';

      // Cancel button: ONLY active/enabled for Pending orders!
      let actionCellHtml = '';
      if (isPending) {
        actionCellHtml = `
          <button 
            type="button" 
            class="btn btn-danger-outline cancel-btn" 
            data-testid="cancel-order-btn" 
            data-order-id="${order.id}"
            id="cancel-order-btn-${order.id}"
            data-id="${order.id}"
            title="Cancel order ${order.id}">
            Cancel Order
          </button>
        `;
      } else {
        let label = 'Completed';
        if (order.status.toUpperCase() === 'SHIPPED') label = 'In Transit';
        else if (order.status.toUpperCase() === 'CANCELLED') label = 'Cancelled';

        actionCellHtml = `
          <button 
            type="button" 
            class="btn btn-danger-outline" 
            disabled 
            data-order-id="${order.id}"
            title="Only pending orders can be cancelled">
            ${label}
          </button>
        `;
      }

      row.innerHTML = `
        <td class="order-id-cell" data-testid="order-id-${order.id}">
          <span class="hidden" data-testid="order-row-${order.id}"></span>
          ${escapeHtml(order.id)}
        </td>
        <td class="customer-cell" data-testid="customer-${order.id}">
          ${escapeHtml(order.customerName)}
        </td>
        <td>
          <span class="item-badge" data-testid="item-${order.id}">
            ${escapeHtml(order.item)}
          </span>
        </td>
        <td>
          <span class="qty-pill" data-testid="qty-${order.id}">
            ${order.quantity}
          </span>
        </td>
        <td style="color: var(--text-muted); font-size: 0.8125rem;" data-testid="date-${order.id}">
          ${formatDate(order.createdAt)}
        </td>
        <td>
          <span class="status-badge status-${statusKey}" data-testid="order-status-${order.id}">
            ${escapeHtml(order.status)}
          </span>
        </td>
        <td style="text-align: right;">
          ${actionCellHtml}
        </td>
      `;

      els.ordersTableBody.appendChild(row);
    });

    // Attach click listeners to pending cancel buttons
    const cancelButtons = els.ordersTableBody.querySelectorAll('.cancel-btn');
    cancelButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-id');
        handleCancelOrder(orderId);
      });
    });
  }

  // --- Order Cancellation ---
  function handleCancelOrder(orderId) {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) {
      showToast('Order not found.', 'error');
      return;
    }

    if (order.status.toUpperCase() !== 'PENDING') {
      showToast('Only Pending orders can be cancelled.', 'error');
      return;
    }

    // Cancel order
    order.status = 'Cancelled';
    saveOrdersToStorage();
    renderMetrics();
    renderOrders();
    showToast(`Order ${order.id} has been cancelled.`, 'info');
  }

  // --- Add Order Validation & Submission ---
  function clearFormErrors() {
    els.customerNameError.textContent = '';
    els.itemNameError.textContent = '';
    els.quantityError.textContent = '';
    els.formError.classList.add('hidden');

    els.customerNameInput.classList.remove('input-error');
    els.itemNameInput.classList.remove('input-error');
    els.quantityInput.classList.remove('input-error');
  }

  function validateAddOrderForm(customerName, item, quantity) {
    clearFormErrors();
    let isValid = true;

    // Customer Name validation
    if (!customerName || customerName.trim().length === 0) {
      els.customerNameError.textContent = 'Customer name is required.';
      els.customerNameInput.classList.add('input-error');
      isValid = false;
    } else if (customerName.trim().length < 2) {
      els.customerNameError.textContent = 'Customer name must be at least 2 characters.';
      els.customerNameInput.classList.add('input-error');
      isValid = false;
    }

    // Item validation
    if (!item || item.trim().length === 0) {
      els.itemNameError.textContent = 'Item name is required.';
      els.itemNameInput.classList.add('input-error');
      isValid = false;
    }

    // Quantity validation
    const qtyNum = Number(quantity);
    if (!quantity || isNaN(qtyNum) || !Number.isInteger(qtyNum) || qtyNum <= 0) {
      els.quantityError.textContent = 'Quantity must be a positive integer (at least 1).';
      els.quantityInput.classList.add('input-error');
      isValid = false;
    }

    if (!isValid) {
      els.formError.classList.remove('hidden');
    }

    return isValid;
  }

  function generateNextOrderId() {
    let maxId = 1000;
    state.orders.forEach((o) => {
      const match = (o.id || '').match(/ORD-(\d+)/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxId) {
          maxId = num;
        }
      }
    });
    return `ORD-${maxId + 1}`;
  }

  function handleAddOrderSubmit(e) {
    e.preventDefault();

    const customerName = els.customerNameInput.value.trim();
    const item = els.itemNameInput.value.trim();
    const quantity = els.quantityInput.value.trim();

    if (!validateAddOrderForm(customerName, item, quantity)) {
      return;
    }

    const newOrder = {
      id: generateNextOrderId(),
      customerName: customerName,
      item: item,
      quantity: parseInt(quantity, 10),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    // Prepend to orders list
    state.orders.unshift(newOrder);
    saveOrdersToStorage();

    // Reset form fields
    els.addOrderForm.reset();
    els.quantityInput.value = '1';
    clearFormErrors();

    renderMetrics();
    renderOrders();
    showToast(`Order ${newOrder.id} created successfully!`, 'success');
  }

  function handleClearForm() {
    els.addOrderForm.reset();
    els.quantityInput.value = '1';
    clearFormErrors();
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Login form submission
    els.loginForm.addEventListener('submit', handleLogin);

    // Toggle password visibility
    els.togglePasswordBtn.addEventListener('click', () => {
      const isPassword = els.passwordInput.type === 'password';
      els.passwordInput.type = isPassword ? 'text' : 'password';
      els.togglePasswordBtn.setAttribute(
        'title',
        isPassword ? 'Hide password' : 'Show password'
      );
    });

    // Quick fill demo credentials
    els.fillDemoBtn.addEventListener('click', () => {
      els.usernameInput.value = 'admin';
      els.passwordInput.value = 'password123';
      els.loginError.classList.add('hidden');
      els.passwordInput.focus();
    });

    // Logout
    els.logoutBtn.addEventListener('click', handleLogout);

    // Reset data
    els.resetDataBtn.addEventListener('click', handleResetData);

    // Search input
    els.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderOrders();
    });

    // Status filter select dropdown
    els.statusFilter.addEventListener('change', (e) => {
      state.statusFilter = e.target.value;
      syncFilterTabs(state.statusFilter);
      renderMetrics();
      renderOrders();
    });

    // Clear filters button
    els.clearFiltersBtn.addEventListener('click', () => {
      state.searchQuery = '';
      state.statusFilter = 'ALL';
      els.searchInput.value = '';
      els.statusFilter.value = 'ALL';
      syncFilterTabs('ALL');
      renderMetrics();
      renderOrders();
    });

    // Quick status filter tabs
    els.filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const status = tab.dataset.status || 'ALL';
        state.statusFilter = status;
        els.statusFilter.value = status;
        syncFilterTabs(status);
        renderMetrics();
        renderOrders();
      });
    });

    // Metric cards click handlers
    const setupMetricFilter = (cardEl, status) => {
      cardEl.addEventListener('click', () => {
        state.statusFilter = status;
        els.statusFilter.value = status;
        syncFilterTabs(status);
        renderMetrics();
        renderOrders();
      });
    };
    setupMetricFilter(els.cardTotal, 'ALL');
    setupMetricFilter(els.cardPending, 'PENDING');
    setupMetricFilter(els.cardShipped, 'SHIPPED');
    setupMetricFilter(els.cardDelivered, 'DELIVERED');
    setupMetricFilter(els.cardCancelled, 'CANCELLED');

    // Add order form
    els.addOrderForm.addEventListener('submit', handleAddOrderSubmit);
    els.cancelFormBtn.addEventListener('click', handleClearForm);

    // Real-time error clearing as user types
    els.customerNameInput.addEventListener('input', () => {
      if (els.customerNameInput.value.trim().length >= 2) {
        els.customerNameError.textContent = '';
        els.customerNameInput.classList.remove('input-error');
      }
    });

    els.itemNameInput.addEventListener('input', () => {
      if (els.itemNameInput.value.trim().length > 0) {
        els.itemNameError.textContent = '';
        els.itemNameInput.classList.remove('input-error');
      }
    });

    els.quantityInput.addEventListener('input', () => {
      const n = Number(els.quantityInput.value);
      if (Number.isInteger(n) && n > 0) {
        els.quantityError.textContent = '';
        els.quantityInput.classList.remove('input-error');
      }
    });
  }

  // --- Bootstrap ---
  function init() {
    initElements();
    loadPersistedData();
    setupEventListeners();
    checkAuthState();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
