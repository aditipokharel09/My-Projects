/* Inventory: stock movement log, Stock In / Stock Out with reason dropdowns */
let invFilter = { type: '', q: '' };

function renderInventory(c) {
    const units = db.products.reduce((a, p) => a + p.quantity, 0);
    const value = db.products.reduce((a, p) => a + p.quantity * p.purchasePrice, 0);
    const inQty = db.inventoryLogs.filter(l => l.qty > 0).reduce((a, l) => a + l.qty, 0);
    const outQty = Math.abs(db.inventoryLogs.filter(l => l.qty < 0).reduce((a, l) => a + l.qty, 0));
    const stat = (t, v, cls = 'text-slate-800') => `<div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><p class="text-xs font-semibold text-slate-500">${t}</p><h3 class="text-2xl font-bold ${cls} mt-1">${v}</h3></div>`;
    const chip = (v, l) => `<button onclick="invFilter.type='${v}';renderTabContent('inventory')" class="px-3 py-1.5 rounded-full text-xs font-medium border transition ${invFilter.type === v ? 'bg-inventro-900 text-white border-inventro-900' : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'}">${l}</button>`;
    c.innerHTML = `<div class="space-y-6">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            ${stat('Units in Stock', units)}${stat('Stock Value (at cost)', money(value), 'text-inventro-900')}
            ${stat('Total Stock In', inQty, 'text-emerald-700')}${stat('Total Stock Out', outQty, 'text-amber-600')}
        </div>
        <div class="${PANEL}">
            <div class="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
                <div class="flex flex-wrap items-center gap-2">${searchBox('inv-search', invFilter.q, 'invFilter.q=this.value;refreshInventoryLog()', 'Search product or reason...')}
                    ${chip('', 'All')}${chip('Stock In', 'Stock In')}${chip('Stock Out', 'Stock Out')}</div>
                <div class="flex gap-2">
                    <button onclick="openStockModal('', 'in')" class="${BTN}"><i class="fa-solid fa-arrow-down"></i> Stock In</button>
                    <button onclick="openStockModal('', 'out')" class="${BTN.replace('bg-inventro-900 hover:bg-inventro-800', 'bg-amber-600 hover:bg-amber-700')}"><i class="fa-solid fa-arrow-up"></i> Stock Out</button>
                </div>
            </div>
            <div id="inv-log"></div>
        </div></div>`;
    refreshInventoryLog();
}

function refreshInventoryLog() {
    const q = invFilter.q.toLowerCase();
    const list = db.inventoryLogs.slice().reverse().filter(l => (!invFilter.type || l.type === invFilter.type) && (!q || (l.product + l.reference).toLowerCase().includes(q))).slice(0, 150);
    const rows = list.map(l => `<tr class="hover:bg-slate-50 transition">
        <td class="p-3 font-semibold text-slate-800">LOG-${l.id}</td><td class="p-3 text-slate-500">${l.date}</td>
        <td class="p-3 font-medium text-slate-900">${esc(l.product)}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-semibold ${l.qty > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">${l.type}</span></td>
        <td class="p-3 text-right font-bold ${l.qty > 0 ? 'text-emerald-600' : 'text-rose-600'}">${l.qty > 0 ? '+' + l.qty : l.qty}</td>
        <td class="p-3 text-slate-500">${esc(l.reference)}</td></tr>`).join('');
    document.getElementById('inv-log').innerHTML = tableHTML(['Log ID', 'Date & Time', 'Product', 'Type', '>Qty', 'Reason / Reference'], rows, 'No stock movements found.');
}

function openStockModal(productId = '', type = 'in') {
    if (!db.products.length) { showToast('Add a product first.', 'error'); return; }
    const sel = productId || db.products[0].id;
    openModal('Adjust Stock', `
        <form onsubmit="submitStock(event)" class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-2">
                <label class="cursor-pointer"><input type="radio" name="adj-type" value="in" class="peer hidden" ${type === 'in' ? 'checked' : ''} onchange="swapReasons()">
                    <span class="block text-center py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600"><i class="fa-solid fa-arrow-down mr-1"></i> Stock In (add)</span></label>
                <label class="cursor-pointer"><input type="radio" name="adj-type" value="out" class="peer hidden" ${type === 'out' ? 'checked' : ''} onchange="swapReasons()">
                    <span class="block text-center py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 peer-checked:bg-amber-600 peer-checked:text-white peer-checked:border-amber-600"><i class="fa-solid fa-arrow-up mr-1"></i> Stock Out (remove)</span></label>
            </div>
            <div><label class="${LBL}">Product</label>
                <select id="adj-product" onchange="updateAdjPreview()" class="${INP}">${db.products.map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.name)} — ${p.quantity} ${esc(p.unit)} in stock</option>`).join('')}</select></div>
            <div><label class="${LBL}">Quantity</label>
                <input id="adj-qty" type="number" min="1" required value="10" oninput="updateAdjPreview()" class="${INP}">
                <div class="flex gap-2 mt-2">${[1, 5, 10, 20, 50, 100].map(n => `<button type="button" onclick="document.getElementById('adj-qty').value=${n};updateAdjPreview()" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-inventro-900 hover:text-white text-[11px] font-medium text-slate-700 transition">${n}</button>`).join('')}</div>
                <p id="adj-preview" class="text-xs text-slate-500 mt-2"></p></div>
            ${selectF('adj-reason', 'Reason', type === 'in' ? 'stockInReasons' : 'stockOutReasons', '')}
            ${inputF('adj-ref', 'Reference / note (optional)', '', 'placeholder="e.g. PO-1049, invoice number"')}
            ${formButtons('Save Adjustment')}
        </form>`);
    updateAdjPreview();
}
const adjType = () => document.querySelector('input[name="adj-type"]:checked').value;

function swapReasons() {
    const s = document.getElementById('adj-reason');
    s.dataset.key = adjType() === 'in' ? 'stockInReasons' : 'stockOutReasons';
    s.innerHTML = optionsHTML(s.dataset.key, '') + ADD_NEW;
    document.getElementById('adj-reason-new').classList.add('hidden');
    updateAdjPreview();
}
function updateAdjPreview() {
    const p = db.products.find(x => x.id === val('adj-product')), q = parseInt(val('adj-qty')) || 0, el = document.getElementById('adj-preview');
    if (!p || !el) return;
    const after = p.quantity + (adjType() === 'in' ? q : -q);
    el.innerHTML = `Stock will change from <b>${p.quantity}</b> to <b class="${after < 0 ? 'text-rose-600' : 'text-inventro-900'}">${after}</b> ${esc(p.unit)}`;
}
function submitStock(e) {
    e.preventDefault();
    const p = db.products.find(x => x.id === val('adj-product')), type = adjType(), qty = parseInt(val('adj-qty'));
    const reason = pickVal('adj-reason', 'reason'); if (!reason) return;
    if (type === 'out' && qty > p.quantity) { showToast(`Only ${p.quantity} ${p.unit} in stock.`, 'error'); return; }
    const note = val('adj-ref').trim();
    p.quantity += type === 'in' ? qty : -qty;
    db.inventoryLogs.push({ id: nextNum(db.inventoryLogs), date: nowStr(), product: p.name, type: type === 'in' ? 'Stock In' : 'Stock Out', qty: type === 'in' ? qty : -qty, reference: reason + (note ? ' – ' + note : '') });
    saveDatabase(); closeModal(); renderTabContent(activeTab);
    showToast('Stock updated successfully!', 'success');
}
