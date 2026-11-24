/* Suppliers: pick supplied categories from chips */
function renderSuppliers(c) {
    c.innerHTML = `<div class="${PANEL}">
        <div class="flex justify-between items-center gap-3">
            <h3 class="font-bold text-sm text-slate-800">Supplier Directory</h3>
            <button onclick="openSupplierModal()" class="${BTN}"><i class="fa-solid fa-truck-field"></i> Add Supplier</button>
        </div>
        ${tableHTML(['Supplier', 'City', 'Phone', 'Email', 'Supplies', '>Actions'], db.suppliers.map(s => `<tr class="hover:bg-slate-50 transition">
            <td class="p-3 font-semibold text-slate-800">${esc(s.name)}</td><td class="p-3">${esc(s.city)}</td>
            <td class="p-3 text-slate-500">${esc(s.contact)}</td><td class="p-3 text-slate-500">${esc(s.email)}</td>
            <td class="p-3"><div class="flex flex-wrap gap-1">${(s.categories || []).map(x => `<span class="px-2 py-0.5 rounded-full bg-inventro-50 border border-inventro-100 text-inventro-900 text-[10px] font-medium">${esc(x)}</span>`).join('')}</div>
                ${s.products ? `<p class="text-[11px] text-slate-500 mt-1">${esc(s.products)}</p>` : ''}</td>
            <td class="p-3 text-right space-x-1">${iconBtn('fa-pen', 'Edit', `openSupplierModal(${s.id})`)}${isAdmin() ? iconBtn('fa-trash', 'Delete', `deleteSupplier(${s.id})`, true) : ''}</td></tr>`).join(''), 'No suppliers yet.')}
    </div>`;
}
function openSupplierModal(id = null) {
    const s = id !== null ? db.suppliers.find(x => x.id === id) : { name: '', contact: '', email: '', city: db.options.cities[0], categories: [], products: '' };
    openModal(id !== null ? 'Edit Supplier' : 'Add New Supplier', `<form onsubmit="saveSupplier(event,${id === null ? 'null' : id})" class="p-6 space-y-4">
        ${inputF('s-name', 'Supplier Name', s.name, 'required')}
        <div class="grid grid-cols-2 gap-4">${inputF('s-contact', 'Phone Number', s.contact, 'required')}${selectF('s-city', 'City', 'cities', s.city)}</div>
        ${inputF('s-email', 'Email (optional)', s.email === '-' ? '' : s.email, 'type="email"')}
        <div><label class="${LBL}">What do they supply? (tap to select)</label>
            <div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto">${optList('categories').map(cat => `<label class="cursor-pointer"><input type="checkbox" name="s-cat" value="${esc(cat)}" class="peer hidden" ${(s.categories || []).includes(cat) ? 'checked' : ''}>
                <span class="inline-block px-3 py-1 rounded-full text-[11px] border border-slate-300 bg-slate-50 text-slate-600 peer-checked:bg-inventro-900 peer-checked:text-white peer-checked:border-inventro-900 transition">${esc(cat)}</span></label>`).join('')}</div></div>
        ${inputF('s-products', 'Specific products (optional)', s.products, 'placeholder="Keyboards, Mouse, Hubs..."')}
        ${formButtons('Save Supplier')}</form>`);
}
function saveSupplier(e, id) {
    e.preventDefault();
    const city = pickVal('s-city', 'city'); if (!city) return;
    const data = { name: val('s-name').trim(), contact: val('s-contact').trim(), email: val('s-email').trim() || '-', city, products: val('s-products').trim(), categories: [...document.querySelectorAll('input[name="s-cat"]:checked')].map(i => i.value) };
    if (id === null) db.suppliers.push({ id: nextNum(db.suppliers), ...data });
    else {
        const s = db.suppliers.find(x => x.id === id);
        if (s.name !== data.name) db.products.forEach(p => { if (p.supplier === s.name) p.supplier = data.name; });
        Object.assign(s, data);
    }
    saveDatabase(); closeModal(); renderTabContent('suppliers'); showToast('Supplier saved successfully!', 'success');
}
function deleteSupplier(id) {
    if (!requireAdmin()) return;
    const s = db.suppliers.find(x => x.id === id), used = db.products.filter(p => p.supplier === s.name).length;
    if (used) { showToast(`${used} product(s) use this supplier. Change them first.`, 'error'); return; }
    if (confirm(`Delete supplier "${s.name}"?`)) { db.suppliers = db.suppliers.filter(x => x.id !== id); saveDatabase(); renderTabContent('suppliers'); showToast('Supplier deleted.', 'info'); }
}
