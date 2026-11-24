/* Settings: store config, dropdown list manager, backup / restore */
const OPTION_META = [
    { key: 'categories', title: 'Product Categories', icon: 'fa-tags', hint: 'Shown when adding, filtering and selling products.' },
    { key: 'units', title: 'Units of Measure', icon: 'fa-ruler', hint: 'Piece, Box, Kg... shown next to stock quantities.' },
    { key: 'paymentMethods', title: 'Payment Methods', icon: 'fa-credit-card', hint: 'Choices at the POS checkout.' },
    { key: 'customerTypes', title: 'Customer Types', icon: 'fa-user-tag', hint: 'Used to group and filter customers.' },
    { key: 'cities', title: 'Cities / Locations', icon: 'fa-location-dot', hint: 'Used for customers and suppliers.' },
    { key: 'stockInReasons', title: 'Stock-In Reasons', icon: 'fa-arrow-down', hint: 'Why stock is being added.' },
    { key: 'stockOutReasons', title: 'Stock-Out Reasons', icon: 'fa-arrow-up', hint: 'Why stock is being removed (besides sales).' }
];
// Which records use a list, so renames carry over and used items can't be deleted
const OPTION_USAGE = {
    categories: [['products', 'category']], units: [['products', 'unit']],
    customerTypes: [['customers', 'type']], cities: [['customers', 'city'], ['suppliers', 'city']]
};
const CURRENCIES = [['Rs. ', 'Rs. — Nepali Rupee'], ['₹', '₹ — Indian Rupee'], ['$', '$ — US Dollar'], ['€', '€ — Euro'], ['£', '£ — Pound'], ['¥', '¥ — Yen / Yuan'], ['AED ', 'AED — Dirham']];

function renderSettings(c) {
    const admin = isAdmin();
    const cur = CURRENCIES.some(x => x[0] === db.settings.currency) ? CURRENCIES : [...CURRENCIES, [db.settings.currency, db.settings.currency]];
    c.innerHTML = `<div class="space-y-6">
        ${admin ? '' : '<div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800"><i class="fa-solid fa-lock mr-1"></i> Only an administrator can change settings. You can view the lists below.</div>'}
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-3xl space-y-4">
            <h3 class="font-bold text-sm text-slate-800">Store Configuration</h3>
            <form onsubmit="saveSettings(event)" class="space-y-4">
                ${inputF('set-store', 'Store Name', db.settings.storeName, 'required')}
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label class="${LBL}">Currency</label><select id="set-currency" class="${INP}">${cur.map(([v, l]) => `<option value="${esc(v)}" ${v === db.settings.currency ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
                    ${inputF('set-tax', 'Sales Tax / VAT (%)', db.settings.taxRate, 'type="number" min="0" max="100" step="0.01" required')}
                    ${inputF('set-threshold', 'Low-stock warning at', db.settings.lowStockThreshold, 'type="number" min="0" required')}
                </div>
                ${admin ? `<button type="submit" class="${BTN}">Save Settings</button>` : ''}
            </form>
        </div>
        <div><h3 class="font-bold text-sm text-slate-800">Dropdown Lists</h3>
            <p class="text-xs text-slate-500 mt-1">These are the choices staff pick from across the system. ${admin ? 'Add, rename or remove any of them.' : ''}</p></div>
        <div id="options-manager" class="grid grid-cols-1 lg:grid-cols-2 gap-4"></div>
        ${admin ? `<div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-3xl space-y-3">
            <h3 class="font-bold text-sm text-slate-800">Backup & Restore</h3>
            <p class="text-xs text-slate-500">Data is stored in this browser. Download a backup regularly.</p>
            <div class="flex flex-wrap gap-2">
                <button onclick="exportData()" class="${BTN}"><i class="fa-solid fa-download"></i> Download Backup</button>
                <label class="${BTN2} cursor-pointer flex items-center gap-2"><i class="fa-solid fa-upload"></i> Restore Backup<input type="file" accept=".json" class="hidden" onchange="importData(this)"></label>
                <button onclick="resetData()" class="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-xl transition"><i class="fa-solid fa-rotate-left mr-1"></i> Reset to Demo Data</button>
            </div></div>` : ''}
    </div>`;
    renderOptionsManager();
}

function saveSettings(e) {
    e.preventDefault();
    if (!requireAdmin()) return;
    Object.assign(db.settings, { storeName: val('set-store').trim(), currency: val('set-currency'), taxRate: parseFloat(val('set-tax')), lowStockThreshold: parseInt(val('set-threshold')) });
    saveDatabase(); showToast('Settings updated successfully!', 'success');
}

function renderOptionsManager() {
    const admin = isAdmin();
    document.getElementById('options-manager').innerHTML = OPTION_META.map(m => `
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div class="flex items-center gap-2"><i class="fa-solid ${m.icon} text-inventro-700"></i><h4 class="font-bold text-sm text-slate-800">${m.title}</h4><span class="ml-auto text-[11px] text-slate-400">${db.options[m.key].length} options</span></div>
            <p class="text-[11px] text-slate-500 mt-1 mb-3">${m.hint}</p>
            <div class="flex flex-wrap gap-2 mb-3 max-h-44 overflow-y-auto">${db.options[m.key].map((o, i) => `
                <span class="inline-flex items-center gap-1.5 pl-3 ${admin ? 'pr-2' : 'pr-3'} py-1 bg-inventro-50 border border-inventro-100 text-inventro-900 rounded-full text-[11px] font-medium">${esc(o)}
                ${admin ? `<button onclick="renameOption('${m.key}',${i})" title="Rename" class="text-slate-400 hover:text-inventro-700"><i class="fa-solid fa-pen text-[9px]"></i></button>
                <button onclick="deleteOption('${m.key}',${i})" title="Remove" class="text-slate-400 hover:text-rose-600"><i class="fa-solid fa-xmark"></i></button>` : ''}</span>`).join('') || '<span class="text-xs text-slate-400">No options yet.</span>'}</div>
            ${admin ? `<div class="flex gap-2"><input id="new-${m.key}" onkeydown="if(event.key==='Enter')addFromManager('${m.key}')" class="${INP}" placeholder="Type a new option and press Enter">
                <button onclick="addFromManager('${m.key}')" class="${BTN}">Add</button></div>` : ''}
        </div>`).join('');
}
function addFromManager(key) {
    if (!requireAdmin()) return;
    const inp = document.getElementById('new-' + key), v = inp.value.trim();
    if (!v) return;
    if (db.options[key].some(o => o.toLowerCase() === v.toLowerCase())) { showToast('That option already exists.', 'error'); return; }
    db.options[key].push(v); saveDatabase(); renderOptionsManager();
    document.getElementById('new-' + key).focus();
}
function renameOption(key, i) {
    if (!requireAdmin()) return;
    const old = db.options[key][i], v = (prompt('Rename option:', old) || '').trim();
    if (!v || v === old) return;
    if (db.options[key].some((o, j) => j !== i && o.toLowerCase() === v.toLowerCase())) { showToast('That option already exists.', 'error'); return; }
    db.options[key][i] = v;
    (OPTION_USAGE[key] || []).forEach(([table, field]) => db[table].forEach(r => { if (r[field] === old) r[field] = v; }));
    saveDatabase(); renderOptionsManager(); showToast('Renamed everywhere it was used.', 'success');
}
function deleteOption(key, i) {
    if (!requireAdmin()) return;
    const name = db.options[key][i];
    const used = (OPTION_USAGE[key] || []).reduce((n, [table, field]) => n + db[table].filter(r => r[field] === name).length, 0);
    if (used) { showToast(`"${name}" is used by ${used} record(s). Change those first.`, 'error'); return; }
    if (confirm(`Remove "${name}" from the list?`)) { db.options[key].splice(i, 1); saveDatabase(); renderOptionsManager(); }
}

function exportData() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }));
    a.download = `inventro-backup-${nowStr().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href);
}
function importData(input) {
    const f = input.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
        try {
            const d = JSON.parse(r.result);
            if (!d.products || !d.users || !d.settings) throw new Error();
            if (!confirm('Replace ALL current data with this backup?')) return;
            db = d; migrateDatabase(); saveDatabase(); handleLogout(); showToast('Backup restored. Please sign in again.', 'success');
        } catch (e) { showToast('That file is not a valid Inventro backup.', 'error'); }
    };
    r.readAsText(f);
}
function resetData() {
    if (!confirm('Erase everything and go back to the demo data?')) return;
    db = clone(INITIAL_DB); migrateDatabase(); saveDatabase(); handleLogout();
}
