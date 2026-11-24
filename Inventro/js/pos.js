/* Sales / POS: category chips, +/- cart, discount + tax, customer & payment dropdowns */
let cart = [];
const posState = { customer: 'Walk-in Customer', payment: 'Cash', discount: 0, cat: '', q: '' };
const DISCOUNTS = [0, 5, 10, 15, 20, 25, 30, 50];

function renderPOS(c) {
    c.innerHTML = `<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3 lg:h-[calc(100vh-140px)]">
            <div class="flex items-center justify-between gap-3">
                <h3 class="font-bold text-sm text-slate-800">Choose products</h3>
                ${searchBox('pos-search', posState.q, 'posState.q=this.value;refreshPOSGrid()', 'Search catalog...')}
            </div>
            <div id="pos-cats" class="flex gap-2 overflow-x-auto pb-1"></div>
            <div id="pos-grid" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto pr-1 flex-1 content-start"></div>
        </div>
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col lg:h-[calc(100vh-140px)]">
            <h3 class="font-bold text-sm text-slate-800">Current order</h3>
            <div id="pos-cart-list" class="flex-1 overflow-y-auto divide-y divide-slate-100 my-3 min-h-[120px]"></div>
            <div class="border-t border-slate-200 pt-3 space-y-3 overflow-y-auto">
                ${selectF('pos-customer', 'Customer', 'customers', posState.customer, { cb: 'posSet' })}
                <div class="grid grid-cols-2 gap-3">
                    ${selectF('pos-payment', 'Payment method', 'paymentMethods', posState.payment, { cb: 'posSet' })}
                    <div><label class="${LBL}">Discount</label>
                        <select id="pos-discount" onchange="posState.discount=+this.value;refreshCart()" class="${INP}">
                            ${DISCOUNTS.map(d => `<option value="${d}" ${d === posState.discount ? 'selected' : ''}>${d === 0 ? 'No discount' : d + '% off'}</option>`).join('')}
                        </select></div>
                </div>
                <div id="pos-totals"></div>
                <button onclick="completePOSCheckout()" class="w-full py-3 bg-inventro-900 hover:bg-inventro-800 text-white font-semibold rounded-xl shadow-lg transition text-xs">
                    <i class="fa-solid fa-check mr-1"></i> Complete Sale & Print Receipt</button>
            </div>
        </div></div>`;
    refreshPOSGrid(); refreshCart();
}
function posSet(v, id) { posState[id.replace('pos-', '')] = v; }

function refreshPOSGrid() {
    const cats = [...new Set(db.products.map(p => p.category))];
    document.getElementById('pos-cats').innerHTML = ['', ...cats].map(cat =>
        `<button onclick="posState.cat=${JSON.stringify(cat).replace(/"/g, '&quot;')};refreshPOSGrid()" class="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${posState.cat === cat ? 'bg-inventro-900 text-white border-inventro-900' : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'}">${cat ? esc(cat) : 'All'}</button>`).join('');
    const q = posState.q.toLowerCase();
    const list = db.products.filter(p => (!posState.cat || p.category === posState.cat) && (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)));
    document.getElementById('pos-grid').innerHTML = list.map(p => `
        <div onclick="addToPOSCart('${p.id}')" class="bg-slate-50 border border-slate-200 hover:border-inventro-900 rounded-xl p-4 cursor-pointer transition flex flex-col justify-between group ${p.quantity <= 0 ? 'opacity-50' : ''}">
            <div>
                <div class="flex items-center justify-between mb-1 gap-2">
                    <span class="text-[10px] text-inventro-900 font-bold truncate">${esc(p.category)}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded shrink-0 ${p.quantity > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">${p.quantity > 0 ? p.quantity + ' in stock' : 'Out'}</span>
                </div>
                <h4 class="font-semibold text-xs text-slate-800 group-hover:text-inventro-900 transition">${esc(p.name)}</h4>
            </div>
            <div class="flex items-center justify-between mt-4">
                <span class="font-bold text-inventro-900 text-sm">${money(p.sellingPrice)}<span class="text-[10px] font-normal text-slate-400"> / ${esc(p.unit)}</span></span>
                <span class="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center text-xs group-hover:bg-inventro-900 group-hover:text-white transition"><i class="fa-solid fa-plus"></i></span>
            </div>
        </div>`).join('') || '<p class="text-xs text-slate-400 col-span-full text-center py-16">No products found.</p>';
}

function cartTotals() {
    const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
    const discount = subtotal * posState.discount / 100;
    const tax = (subtotal - discount) * (db.settings.taxRate || 0) / 100;
    return { subtotal, discount, tax, total: subtotal - discount + tax };
}
function refreshCart() {
    document.getElementById('pos-cart-list').innerHTML = cart.length === 0
        ? '<p class="text-xs text-slate-400 text-center py-14">Cart is empty.<br>Click a product to add it.</p>'
        : cart.map((it, i) => `<div class="py-2.5 flex items-center justify-between gap-2 text-xs">
            <div class="min-w-0"><p class="font-semibold text-slate-800 truncate">${esc(it.name)}</p><p class="text-[11px] text-slate-500">${money(it.price)} each</p></div>
            <div class="flex items-center gap-1.5 shrink-0">
                <button onclick="cartQty(${i},-1)" class="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold">−</button>
                <span class="w-6 text-center font-semibold">${it.qty}</span>
                <button onclick="cartQty(${i},1)" class="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold">+</button>
                <span class="w-20 text-right font-bold text-inventro-900">${money(it.price * it.qty)}</span>
                <button onclick="cart.splice(${i},1);refreshCart()" class="text-rose-500 hover:text-rose-700 p-1"><i class="fa-solid fa-trash text-[11px]"></i></button>
            </div></div>`).join('');
    const t = cartTotals(), row = (l, v, cls = '') => `<div class="flex justify-between ${cls}"><span>${l}</span><span>${v}</span></div>`;
    document.getElementById('pos-totals').innerHTML = `<div class="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
        ${row('Subtotal', money(t.subtotal))}
        ${posState.discount ? row(`Discount (${posState.discount}%)`, '− ' + money(t.discount), 'text-emerald-700') : ''}
        ${db.settings.taxRate ? row(`Tax (${db.settings.taxRate}%)`, money(t.tax)) : ''}
        ${row('Grand Total', money(t.total), 'text-sm font-bold text-slate-800 pt-1')}</div>`;
}

function addToPOSCart(id) {
    const p = db.products.find(x => x.id === id);
    if (!p || p.quantity <= 0) { showToast('Product is out of stock!', 'error'); return; }
    const ex = cart.find(x => x.id === id);
    if (ex) { if (ex.qty + 1 > p.quantity) { showToast('Cannot add more than available stock!', 'error'); return; } ex.qty++; }
    else cart.push({ id: p.id, name: p.name, price: p.sellingPrice, qty: 1, unit: p.unit });
    refreshCart();
}
function cartQty(i, d) {
    const it = cart[i], p = db.products.find(x => x.id === it.id);
    if (it.qty + d > p.quantity) { showToast('Cannot add more than available stock!', 'error'); return; }
    it.qty += d;
    if (it.qty <= 0) cart.splice(i, 1);
    refreshCart();
}

function completePOSCheckout() {
    if (!cart.length) { showToast('Cart is empty!', 'error'); return; }
    const customer = pickVal('pos-customer', 'customer'), payment = pickVal('pos-payment', 'payment method');
    if (!customer || !payment) return;
    for (const it of cart) {
        const p = db.products.find(x => x.id === it.id);
        if (!p || it.qty > p.quantity) { showToast(`Not enough stock for ${it.name}.`, 'error'); return; }
    }
    const t = cartTotals(), year = new Date().getFullYear();
    const seq = db.sales.reduce((m, s) => Math.max(m, parseInt(String(s.id).split('-').pop()) || 0), 0) + 1;
    const invoiceId = `INV-${year}-${String(seq).padStart(3, '0')}`, date = nowStr();
    cart.forEach(it => {
        const p = db.products.find(x => x.id === it.id);
        p.quantity -= it.qty;
        db.inventoryLogs.push({ id: nextNum(db.inventoryLogs), date, product: p.name, type: 'Stock Out', qty: -it.qty, reference: invoiceId });
    });
    const cust = db.customers.find(x => x.name === customer);
    if (cust) cust.purchases += t.total;
    const sale = { id: invoiceId, date, customer, total: t.total, subtotal: t.subtotal, discountPct: posState.discount, discount: t.discount, tax: t.tax, taxRate: db.settings.taxRate, payment, items: cart.reduce((a, i) => a + i.qty, 0), cashier: currentUser.name };
    db.sales.push(sale); saveDatabase();
    const lines = [...cart]; cart = []; posState.discount = 0;
    renderTabContent('pos');
    showInvoiceModal(sale, lines);
    showToast('Sale completed successfully!', 'success');
}

function showInvoiceModal(sale, items) {
    const row = (l, v, cls = '') => `<div class="flex justify-between ${cls}"><span>${l}</span><span>${v}</span></div>`;
    openModal('Official Receipt / Invoice', `<div class="p-6 space-y-4 text-xs text-slate-600">
        <div class="text-center pb-4 border-b border-slate-200"><h4 class="font-bold text-sm text-slate-900">${esc(db.settings.storeName)}</h4><p class="text-slate-500">Tax Invoice & Sales Slip</p></div>
        <div class="flex justify-between">
            <div><p><span class="text-slate-400">Invoice ID:</span> <span class="font-semibold text-slate-800">${sale.id}</span></p><p><span class="text-slate-400">Date:</span> ${sale.date}</p></div>
            <div class="text-right"><p><span class="text-slate-400">Customer:</span> ${esc(sale.customer)}</p><p><span class="text-slate-400">Cashier:</span> ${esc(sale.cashier)}</p></div>
        </div>
        <table class="w-full text-left border-t border-b border-slate-200">
            <thead><tr class="text-slate-400 border-b border-slate-200"><th class="py-2">Item</th><th class="py-2 text-center">Qty</th><th class="py-2 text-right">Price</th><th class="py-2 text-right">Total</th></tr></thead>
            <tbody class="divide-y divide-slate-100">${items.map(i => `<tr><td class="py-2 font-medium text-slate-800">${esc(i.name)}</td><td class="py-2 text-center">${i.qty}</td><td class="py-2 text-right">${money(i.price)}</td><td class="py-2 text-right font-bold text-inventro-900">${money(i.price * i.qty)}</td></tr>`).join('')}</tbody>
        </table>
        <div class="space-y-1">
            ${sale.subtotal !== undefined ? row('Subtotal', money(sale.subtotal)) : ''}
            ${sale.discount ? row(`Discount (${sale.discountPct}%)`, '− ' + money(sale.discount)) : ''}
            ${sale.tax ? row(`Tax (${sale.taxRate}%)`, money(sale.tax)) : ''}
            ${row(`Grand Total (${esc(sale.payment)})`, money(sale.total), 'text-sm font-bold text-slate-800 pt-1')}
        </div>
        <p class="text-center text-slate-400 pt-2">Thank you for shopping with us!</p>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 no-print">
            <button onclick="closeModal()" class="${BTN2}">Close</button>
            <button onclick="printReceipt()" class="${BTN}"><i class="fa-solid fa-print"></i> Print Receipt</button>
        </div></div>`);
}
function printReceipt() {
    document.body.classList.add('print-receipt');
    window.print();
    document.body.classList.remove('print-receipt');
}
