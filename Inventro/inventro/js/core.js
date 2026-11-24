/* Core: database, shared helpers, dropdown builder ("choose or add new"), modal, toast */
const DB_KEY = 'inventro_academic_system_db';
let db = {}, currentUser = null, activeTab = 'dashboard';

// Shared style strings
const INP = 'w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-inventro-600 focus:ring-2 focus:ring-inventro-100';
const LBL = 'block text-xs font-semibold text-slate-700 mb-1';
const BTN = 'px-4 py-2 bg-inventro-900 hover:bg-inventro-800 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2';
const BTN2 = 'px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition';
const PANEL = 'bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5';

// ---------- database ----------
const clone = o => JSON.parse(JSON.stringify(o));
const nextNum = arr => arr.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;

function initDatabase() {
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem(DB_KEY)); } catch (e) { /* ignore */ }
    db = stored && stored.products ? stored : clone(INITIAL_DB);
    migrateDatabase();
    saveDatabase();
}
function saveDatabase() { localStorage.setItem(DB_KEY, JSON.stringify(db)); }

// Fills in anything missing so older saved data keeps working
function migrateDatabase() {
    db.options = db.options || {};
    Object.keys(DEFAULT_OPTIONS).forEach(k => { if (!Array.isArray(db.options[k])) db.options[k] = [...DEFAULT_OPTIONS[k]]; });
    db.products.forEach(p => {
        p.unit = p.unit || 'Piece';
        if (p.category && !db.options.categories.includes(p.category)) db.options.categories.push(p.category);
    });
    db.customers.forEach(c => { c.type = c.type || 'Individual'; c.city = c.city || 'Kathmandu'; });
    db.suppliers.forEach(s => { s.city = s.city || 'Kathmandu'; s.categories = s.categories || []; });
    if (!db.customers.some(c => c.name === 'Walk-in Customer'))
        db.customers.unshift({ id: 0, name: 'Walk-in Customer', contact: '-', email: '-', purchases: 0, type: 'Individual', city: 'Kathmandu' });
    if (db.settings.taxRate === undefined) db.settings.taxRate = 13;
}

// ---------- small helpers ----------
const isAdmin = () => !!currentUser && currentUser.role === 'admin';
const val = id => document.getElementById(id).value;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => db.settings.currency + Number(n || 0).toFixed(2);
function nowStr() {
    const d = new Date(), p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function stockStatus(p) {
    return p.quantity <= 0 ? 'Out of Stock' : (p.quantity <= db.settings.lowStockThreshold ? 'Low Stock' : 'In Stock');
}
function statusBadge(p) {
    const s = stockStatus(p), c = { 'In Stock': 'emerald', 'Low Stock': 'amber', 'Out of Stock': 'rose' }[s];
    return `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-${c}-50 text-${c}-700 border border-${c}-200">${s}</span>`;
}
function iconBtn(icon, title, fn, danger = false) {
    return `<button type="button" onclick="${fn}" title="${title}" class="p-1.5 bg-slate-100 ${danger ? 'hover:bg-rose-600' : 'hover:bg-inventro-900'} hover:text-white text-slate-700 rounded-lg transition"><i class="fa-solid ${icon} text-xs"></i></button>`;
}
function tableHTML(heads, rowsHtml, emptyMsg = 'Nothing to show yet.') {
    return `<div class="overflow-x-auto"><table class="w-full text-left text-xs text-slate-600">
        <thead class="bg-slate-50 text-slate-700 text-[11px] border-b border-slate-200"><tr>
            ${heads.map(h => `<th class="p-3 font-semibold ${h.startsWith('>') ? 'text-right' : ''}">${h.replace(/^>/, '')}</th>`).join('')}
        </tr></thead>
        <tbody class="divide-y divide-slate-100">${rowsHtml || `<tr><td colspan="${heads.length}" class="p-10 text-center text-slate-400">${emptyMsg}</td></tr>`}</tbody>
    </table></div>`;
}
function inputF(id, label, value = '', attrs = '') {
    return `<div><label class="${LBL}" for="${id}">${label}</label><input id="${id}" value="${esc(value)}" ${attrs} class="${INP}"></div>`;
}
function searchBox(id, value, oninput, placeholder) {
    return `<div class="relative w-full sm:w-72"><span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><i class="fa-solid fa-search"></i></span>
        <input id="${id}" value="${esc(value)}" oninput="${oninput}" class="${INP} pl-10" placeholder="${placeholder}"></div>`;
}

// ---------- dropdown lists ("choose from list, or add your own") ----------
// keys: any db.options list, plus 'suppliers' and 'customers' (built from records)
function optList(key) {
    if (key === 'suppliers') return db.suppliers.map(s => s.name);
    if (key === 'customers') return db.customers.map(c => c.name);
    return db.options[key] || [];
}
function optionsHTML(key, selected) {
    return optList(key).map(o => `<option value="${esc(o)}"${o === selected ? ' selected' : ''}>${esc(o)}</option>`).join('');
}
function addOption(key, value) {
    const existing = optList(key).find(o => o.toLowerCase() === value.toLowerCase());
    if (existing) return existing;
    if (key === 'suppliers') db.suppliers.push({ id: nextNum(db.suppliers), name: value, contact: '-', email: '-', city: 'Kathmandu', categories: [], products: '' });
    else if (key === 'customers') db.customers.push({ id: nextNum(db.customers), name: value, contact: '-', email: '-', purchases: 0, type: 'Individual', city: 'Kathmandu' });
    else db.options[key].push(value);
    saveDatabase();
    return value;
}
const ADD_NEW = '<option value="__new__">➕ Add new…</option>';

function selectF(id, label, key, value, { add = true, cb = '' } = {}) {
    return `<div>
        ${label ? `<label class="${LBL}" for="${id}">${label}</label>` : ''}
        <select id="${id}" data-key="${key}" data-cb="${cb}" onfocus="this.dataset.prev=this.value" onchange="onPick(this)" class="${INP}">
            ${optionsHTML(key, value)}${add ? ADD_NEW : ''}
        </select>
        <div id="${id}-new" class="hidden mt-2 flex gap-2">
            <input id="${id}-newval" onkeydown="if(event.key==='Enter'){event.preventDefault();confirmNew('${id}')}" class="${INP}" placeholder="Type the new option">
            <button type="button" onclick="confirmNew('${id}')" class="${BTN}">Add</button>
            <button type="button" onclick="cancelNew('${id}')" class="${BTN2}">Cancel</button>
        </div>
    </div>`;
}
function runCb(sel) { if (sel.dataset.cb && window[sel.dataset.cb]) window[sel.dataset.cb](sel.value, sel.id); }
function onPick(sel) {
    const box = document.getElementById(sel.id + '-new');
    if (sel.value === '__new__') { box.classList.remove('hidden'); document.getElementById(sel.id + '-newval').focus(); }
    else { box.classList.add('hidden'); runCb(sel); }
}
function confirmNew(id) {
    const sel = document.getElementById(id), inp = document.getElementById(id + '-newval'), v = inp.value.trim();
    if (!v) { showToast('Type a name first.', 'error'); return; }
    const chosen = addOption(sel.dataset.key, v);
    sel.innerHTML = optionsHTML(sel.dataset.key, chosen) + ADD_NEW;
    sel.value = chosen;
    inp.value = '';
    document.getElementById(id + '-new').classList.add('hidden');
    showToast(`"${chosen}" added to the list.`, 'success');
    runCb(sel);
}
function cancelNew(id) {
    const sel = document.getElementById(id);
    sel.value = sel.dataset.prev && sel.dataset.prev !== '__new__' ? sel.dataset.prev : (sel.options[0]?.value || '');
    document.getElementById(id + '-new').classList.add('hidden');
}
// Returns the chosen value, or null (with a message) if nothing valid is chosen
function pickVal(id, label) {
    const v = val(id);
    if (!v || v === '__new__') { showToast(`Please choose a ${label}.`, 'error'); return null; }
    return v;
}

// ---------- modal & toast ----------
function openModal(title, body, wide = false) {
    const c = document.getElementById('modal-content'), m = document.getElementById('global-modal');
    c.className = `bg-white rounded-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} shadow-2xl border border-slate-200`;
    c.innerHTML = `<div class="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl no-print">
            <h3 class="font-bold text-base text-slate-800">${title}</h3>
            <button type="button" onclick="closeModal()" class="text-slate-400 hover:text-slate-700"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>${body}`;
    m.classList.remove('hidden'); m.classList.add('flex');
}
const formButtons = label => `<div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
    <button type="button" onclick="closeModal()" class="${BTN2}">Cancel</button>
    <button type="submit" class="${BTN}">${label}</button></div>`;
function closeModal() {
    const m = document.getElementById('global-modal');
    m.classList.add('hidden'); m.classList.remove('flex');
}
function showToast(message, type = 'success') {
    const box = document.getElementById('toast-container'), t = document.createElement('div');
    const bg = type === 'success' ? 'bg-emerald-900 text-emerald-100 border-emerald-700' : (type === 'error' ? 'bg-rose-900 text-rose-100 border-rose-700' : 'bg-slate-800 text-slate-100 border-slate-700');
    const ic = type === 'success' ? 'fa-circle-check text-emerald-400' : (type === 'error' ? 'fa-circle-xmark text-rose-400' : 'fa-circle-info text-slate-300');
    t.className = `px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold pointer-events-auto transition transform translate-y-2 opacity-0 flex items-center gap-2 ${bg}`;
    t.innerHTML = `<i class="fa-solid ${ic}"></i> ${esc(message)}`;
    box.appendChild(t);
    setTimeout(() => t.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => { t.classList.add('translate-y-2', 'opacity-0'); setTimeout(() => t.remove(), 300); }, 3000);
}
function requireAdmin() {
    if (!isAdmin()) { showToast('Only an administrator can do this.', 'error'); return false; }
    return true;
}
