/* Products: search + category/status filters, add/edit with dropdowns */
let productFilter = { q: '', cat: '', status: '' };

function renderProducts(c) {
    const statuses = ['In Stock', 'Low Stock', 'Out of Stock'];
    c.innerHTML = `<div class="${PANEL}">
        <div class="flex flex-col xl:flex-row gap-3 xl:items-center justify-between">
            <div class="flex flex-col sm:flex-row gap-3 flex-1">
                ${searchBox('product-search', productFilter.q, 'productFilter.q=this.value;refreshProducts()', 'Search by name or ID...')}
                <select onchange="productFilter.cat=this.value;refreshProducts()" class="${INP} sm:w-52">
                    <option value="">All categories</option>${optionsHTML('categories', productFilter.cat)}
                </select>
                <select onchange="productFilter.status=this.value;refreshProducts()" class="${INP} sm:w-40">
                    <option value="">Any stock status</option>${statuses.map(s => `<option ${productFilter.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
            </div>
            <button onclick="openProductModal()" class="${BTN}"><i class="fa-solid fa-plus"></i> Add New Product</button>
        </div>
        <p id="product-count" class="text-xs text-slate-500"></p>
        <div id="product-table"></div>
    </div>`;
    refreshProducts();
}

function refreshProducts() {
    const q = productFilter.q.toLowerCase();
    const list = db.products.filter(p =>
        (!q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) &&
        (!productFilter.cat || p.category === productFilter.cat) &&
        (!productFilter.status || stockStatus(p) === productFilter.status));
    document.getElementById('product-count').textContent = `Showing ${list.length} of ${db.products.length} products`;
    const rows = list.map(p => `<tr class="hover:bg-slate-50 transition">
        <td class="p-3 font-semibold text-slate-800">${esc(p.id)}</td>
        <td class="p-3 font-medium text-slate-900">${esc(p.name)}</td>
        <td class="p-3">${esc(p.category)}</td>
        <td class="p-3 text-right font-bold text-inventro-900">${money(p.sellingPrice)}</td>
        <td class="p-3 text-right text-slate-500">${money(p.purchasePrice)}</td>
        <td class="p-3 text-right font-bold text-slate-800">${p.quantity} <span class="font-normal text-slate-400">${esc(p.unit)}</span></td>
        <td class="p-3">${esc(p.supplier)}</td>
        <td class="p-3">${statusBadge(p)}</td>
        <td class="p-3 text-right space-x-1">
            ${iconBtn('fa-plus-minus', 'Adjust stock', `openStockModal('${p.id}')`)}
            ${iconBtn('fa-pen', 'Edit product', `openProductModal('${p.id}')`)}
            ${isAdmin() ? iconBtn('fa-trash', 'Delete product', `deleteProduct('${p.id}')`, true) : ''}
        </td></tr>`).join('');
    document.getElementById('product-table').innerHTML =
        tableHTML(['ID', 'Product', 'Category', '>Selling', '>Purchase', '>Stock', 'Supplier', 'Status', '>Actions'], rows, 'No products match your filters.');
}

function nextProductId() {
    const max = db.products.reduce((m, p) => Math.max(m, parseInt(p.id.replace(/\D/g, '')) || 0), 0);
    return 'PRD-' + String(max + 1).padStart(3, '0');
}

function openProductModal(id = null) {
    const edit = id !== null;
    const p = edit ? db.products.find(x => x.id === id) : { id: nextProductId(), name: '', category: db.options.categories[0], unit: db.options.units[0], sellingPrice: '', purchasePrice: '', quantity: 0, supplier: db.suppliers[0]?.name || '' };
    openModal(edit ? 'Edit Product' : 'Add New Product', `
        <form onsubmit="saveProduct(event,'${id || ''}')" class="p-6 space-y-4">
            <div class="grid grid-cols-3 gap-4">
                ${inputF('p-id', 'Product ID', p.id, 'readonly').replace(INP, INP + ' bg-slate-100')}
                <div class="col-span-2">${inputF('p-name', 'Product Name', p.name, 'required placeholder="e.g. Wireless Mouse"')}</div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                ${selectF('p-category', 'Category', 'categories', p.category)}
                ${selectF('p-unit', 'Unit', 'units', p.unit)}
            </div>
            <div class="grid grid-cols-3 gap-3">
                ${inputF('p-selling', 'Selling Price', p.sellingPrice, 'type="number" step="0.01" min="0" required oninput="updateMargin()"')}
                ${inputF('p-purchase', 'Purchase Price', p.purchasePrice, 'type="number" step="0.01" min="0" required oninput="updateMargin()"')}
                ${inputF('p-qty', edit ? 'Quantity in Stock' : 'Opening Stock', p.quantity, 'type="number" min="0" required')}
            </div>
            <p id="p-margin" class="text-xs text-slate-500 min-h-[1rem]"></p>
            ${selectF('p-supplier', 'Supplier', 'suppliers', p.supplier)}
            ${formButtons('Save Product')}
        </form>`);
    updateMargin();
}

function updateMargin() {
    const el = document.getElementById('p-margin'); if (!el) return;
    const s = parseFloat(val('p-selling')), b = parseFloat(val('p-purchase'));
    if (isNaN(s) || isNaN(b) || !s) { el.textContent = ''; return; }
    const m = s - b;
    el.innerHTML = `Profit per unit: <b class="${m < 0 ? 'text-rose-600' : 'text-emerald-700'}">${money(m)}</b> (${(m / s * 100).toFixed(1)}% margin)`;
}

function saveProduct(e, oldId) {
    e.preventDefault();
    const category = pickVal('p-category', 'category'), unit = pickVal('p-unit', 'unit'), supplier = pickVal('p-supplier', 'supplier');
    if (!category || !unit || !supplier) return;
    const data = {
        id: val('p-id'), name: val('p-name').trim(), category, unit, supplier,
        sellingPrice: parseFloat(val('p-selling')), purchasePrice: parseFloat(val('p-purchase')), quantity: parseInt(val('p-qty'))
    };
    if (oldId) {
        const p = db.products.find(x => x.id === oldId), diff = data.quantity - p.quantity;
        if (diff !== 0) db.inventoryLogs.push({ id: nextNum(db.inventoryLogs), date: nowStr(), product: data.name, type: diff > 0 ? 'Stock In' : 'Stock Out', qty: diff, reference: 'Edited in product form' });
        Object.assign(p, data);
    } else {
        db.products.push(data);
        if (data.quantity > 0) db.inventoryLogs.push({ id: nextNum(db.inventoryLogs), date: nowStr(), product: data.name, type: 'Stock In', qty: data.quantity, reference: 'Opening stock' });
    }
    saveDatabase(); closeModal(); renderTabContent('products');
    showToast('Product saved successfully!', 'success');
}

function deleteProduct(id) {
    if (!requireAdmin()) return;
    if (confirm('Delete this product? This cannot be undone.')) {
        db.products = db.products.filter(x => x.id !== id);
        saveDatabase(); renderTabContent('products'); showToast('Product deleted.', 'info');
    }
}
