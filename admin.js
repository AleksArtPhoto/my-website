const API_BASE = window.BOOKING_API_BASE || '';
const $ = (id) => document.getElementById(id);

let SERVICES = { individual: [], business: [], workStartHour: 9, workEndHour: 20 };
let currentDate = null;
let currentDaySlots = {};
let currentDayBookings = [];
let editingBookingId = null; // null => creating a new booking

const CUSTOMER_FIELDS = {
  individual: [
    { key: 'name', label: 'Full Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'location', label: 'Location / Google Meet contact', type: 'text' },
    { key: 'comment', label: 'Comment', type: 'text' },
  ],
  business: [
    { key: 'companyName', label: 'Company Name', type: 'text' },
    { key: 'cvr', label: 'CVR Number', type: 'text' },
    { key: 'legalAddress', label: 'Legal Address', type: 'text' },
    { key: 'invoiceEmail', label: 'Invoice Email', type: 'email' },
    { key: 'contactName', label: 'Contact Person / PO', type: 'text' },
    { key: 'location', label: 'Shoot Location', type: 'text' },
  ],
};

// ============================================================
// AUTH
// ============================================================
async function checkSession() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/check`, { credentials: 'include' });
    if (res.ok) showApp();
  } catch {
    // stay on login screen
  }
}

function showApp() {
  $('login-screen').classList.add('hidden');
  $('admin-app').classList.remove('hidden');
  initApp();
}

$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('login-error');
  err.classList.add('hidden');

  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: $('login-username').value,
        password: $('login-password').value,
      }),
    });
    if (!res.ok) throw new Error('Invalid username or password.');
    showApp();
  } catch (e2) {
    err.textContent = e2.message;
    err.classList.remove('hidden');
  }
});

$('logout-btn').addEventListener('click', async () => {
  await fetch(`${API_BASE}/api/admin/logout`, { method: 'POST', credentials: 'include' });
  location.reload();
});

// ============================================================
// APP INIT
// ============================================================
let appInitialized = false;

async function initApp() {
  if (appInitialized) return;
  appInitialized = true;

  const res = await fetch(`${API_BASE}/api/services`);
  SERVICES = await res.json();

  new Litepicker({
    element: $('admin-datepicker'),
    format: 'YYYY-MM-DD',
    setup: (picker) => {
      picker.on('selected', () => {
        currentDate = $('admin-datepicker').value;
        loadDay();
      });
    },
  });

  $('new-booking-btn').addEventListener('click', () => openEditorForNew(null, null));
  $('edit-category').addEventListener('change', () => populateServiceSelect($('edit-category').value));
  $('save-btn').addEventListener('click', onSave);
  $('resend-btn').addEventListener('click', onResend);
  $('cancel-booking-btn').addEventListener('click', onCancelBooking);

  // default to today
  const today = new Date();
  currentDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  $('admin-datepicker').value = currentDate;
  loadDay();
}

// ============================================================
// DAY VIEW
// ============================================================
async function loadDay() {
  if (!currentDate) return;
  const res = await fetch(`${API_BASE}/api/admin/day?date=${encodeURIComponent(currentDate)}`, { credentials: 'include' });
  if (!res.ok) return;
  const data = await res.json();
  currentDaySlots = data.slots;
  currentDayBookings = data.bookings;
  renderSlots();
}

function renderSlots() {
  const container = $('admin-slots');
  container.innerHTML = '';

  for (let h = SERVICES.workStartHour; h <= SERVICES.workEndHour; h++) {
    const time = `${h.toString().padStart(2, '0')}:00`;
    const info = currentDaySlots[time];

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'admin-slot';
    btn.textContent = time;

    if (info) {
      if (info.isStart) {
        btn.classList.add(info.status === 'pending_business' ? 'slot-pending_business' : 'slot-confirmed');
      } else {
        btn.classList.add('slot-buffer');
      }
      btn.onclick = () => openBookingById(info.bookingId);
    } else {
      btn.onclick = () => openEditorForNew(currentDate, time);
    }

    container.appendChild(btn);
  }
}

function openBookingById(id) {
  const booking = currentDayBookings.find((b) => b.id === id);
  if (!booking) return;
  editingBookingId = id;
  fillEditor(booking);
}

// ============================================================
// EDITOR
// ============================================================
function populateServiceSelect(category) {
  const select = $('edit-service');
  select.innerHTML = '';
  const list = category === 'business' ? SERVICES.business : SERVICES.individual;
  list.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.price != null ? `${s.name} — ${s.price} DKK` : s.name;
    select.appendChild(opt);
  });
}

function renderCustomerFields(category, values = {}) {
  const container = $('edit-customer-fields');
  container.innerHTML = '';
  CUSTOMER_FIELDS[category].forEach((f) => {
    const group = document.createElement('div');
    group.className = 'form-group';
    const label = document.createElement('label');
    label.textContent = f.label;
    const input = document.createElement('input');
    input.className = 'form-input';
    input.type = f.type;
    input.dataset.customerKey = f.key;
    input.value = values[f.key] || '';
    group.appendChild(label);
    group.appendChild(input);
    container.appendChild(group);
  });
}

function getCustomerFieldValues() {
  const values = {};
  $('edit-customer-fields').querySelectorAll('[data-customer-key]').forEach((el) => {
    values[el.dataset.customerKey] = el.value.trim();
  });
  return values;
}

function openEditorForNew(date, time) {
  editingBookingId = null;
  $('no-selection').classList.add('hidden');
  $('booking-editor').classList.remove('hidden');
  $('editor-error').classList.add('hidden');
  $('editor-success').classList.add('hidden');

  $('edit-category').disabled = false;
  $('edit-category').value = 'individual';
  populateServiceSelect('individual');
  $('edit-service').selectedIndex = 0;
  $('edit-status').value = 'confirmed';
  $('edit-date').value = date || '';
  $('edit-time').value = time || '';
  $('edit-price').value = '';
  $('edit-note').value = '';
  renderCustomerFields('individual');

  $('resend-btn').classList.add('hidden');
  $('cancel-booking-btn').classList.add('hidden');
}

function fillEditor(booking) {
  $('no-selection').classList.add('hidden');
  $('booking-editor').classList.remove('hidden');
  $('editor-error').classList.add('hidden');
  $('editor-success').classList.add('hidden');

  $('edit-category').value = booking.category;
  $('edit-category').disabled = true; // category isn't changeable on an existing booking
  populateServiceSelect(booking.category);
  $('edit-service').value = booking.serviceId;
  $('edit-status').value = booking.status === 'expired' ? 'cancelled' : booking.status;
  $('edit-date').value = booking.date || '';
  $('edit-time').value = booking.time || '';
  $('edit-price').value = booking.price || '';
  $('edit-note').value = booking.adminNote || '';
  renderCustomerFields(booking.category, booking.customer || {});

  $('resend-btn').classList.remove('hidden');
  $('cancel-booking-btn').classList.remove('hidden');
}

async function onSave() {
  const err = $('editor-error');
  const ok = $('editor-success');
  err.classList.add('hidden');
  ok.classList.add('hidden');

  const category = $('edit-category').value;
  const serviceId = $('edit-service').value;
  const date = $('edit-date').value.trim() || null;
  const time = $('edit-time').value.trim() || null;
  const price = parseInt($('edit-price').value, 10) || null;
  const customer = getCustomerFieldValues();
  const notes = $('edit-note').value;

  try {
    if (editingBookingId) {
      const patch = { status: $('edit-status').value, date, time, price, customer, adminNote: notes, serviceId };
      const res = await fetch(`${API_BASE}/api/admin/bookings/${editingBookingId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Could not save.');
    } else {
      const res = await fetch(`${API_BASE}/api/admin/bookings`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, serviceId, date, time, customer, price, notes }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Could not create booking.');
      const data = await res.json();
      editingBookingId = data.booking.id;
    }

    ok.textContent = 'Saved.';
    ok.classList.remove('hidden');
    loadDay();
  } catch (e) {
    err.textContent = e.message;
    err.classList.remove('hidden');
  }
}

async function onResend() {
  if (!editingBookingId) return;
  const err = $('editor-error');
  const ok = $('editor-success');
  err.classList.add('hidden');
  ok.classList.add('hidden');

  try {
    const res = await fetch(`${API_BASE}/api/admin/bookings/${editingBookingId}/resend`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Could not resend.');
    ok.textContent = 'Confirmation email resent.';
    ok.classList.remove('hidden');
  } catch (e) {
    err.textContent = e.message;
    err.classList.remove('hidden');
  }
}

async function onCancelBooking() {
  if (!editingBookingId) return;
  if (!confirm('Cancel this booking and free up the time slot?')) return;

  const res = await fetch(`${API_BASE}/api/admin/bookings/${editingBookingId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (res.ok) {
    $('booking-editor').classList.add('hidden');
    $('no-selection').classList.remove('hidden');
    editingBookingId = null;
    loadDay();
  }
}

checkSession();
