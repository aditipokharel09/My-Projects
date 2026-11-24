/* Customers: filter by type/city, add/edit with dropdowns */
let custFilter = { q: '', type: '', city: '' };

function renderCustomers(c) {
    c.innerHTML = `<div class="${PANEL}">
        <div class="flex flex-col xl:flex-row gap-3 xl:items-center justify-between">
            <div class="flex flex-col sm:flex-row gap-3 flex-1">
                ${searchBox('cust-search', custFilter.q, 'custFilter.q=this.value;refreshCustomers()', 'Search name, phone or email...')}
                <select onchange="custFilter.type=this.value;refreshCustomers()" class="${INP} sm:w-44"><option value="">All types</option>${optionsHTML('customerTypes', custFilter.type)}</select>
                <select onchange="custFilter.city=this.value;refreshCustomers()" class="${INP} sm:w-44"><option value="">All cities</option>${optionsHTML('cities', custFilter.city)}</select>
            </div>
            <button onclick="openCustomerModal()" class="${BTN}"><i class="fa-solid fa-user-plus"></i> Add Customer</button>
        </div><div id="cust-table"></div></div>`;
    refreshCustomers();
}
function refreshCustomers() {
    const q = custFilter.q.toLowerCase();
    const list = db.customers.filter(c => (!q || (c.name + c.contact + c.email).toLowerCase().includes(q)) && (!custFilter.type || c.type === custFilter.type) && (!custFilter.city || c.city === custFilter.city));
    const rows = list.map(c => `<tr class="hover:bg-slate-50 transition">
        <td class="p-3 font-semibold text-slate-800">${esc(c.name)}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-medium">${esc(c.type)}</span></td>
        <td class="p-3">${esc(c.city)}</td><td class="p-3 text-slate-500">${esc(c.contact)}</td><td class="p-3 text-slate-500">${esc(c.email)}</td>
        <td class="p-3 text-right font-bold text-inventro-900">${money(c.purchases)}</td>
        <td class="p-3 text-right space-x-1">${c.id === 0 ? '' : iconBtn('fa-pen', 'Edit', `openCustomerModal(${c.id})`) + (isAdmin() ? iconBtn('fa-trash', 'Delete', `deleteCustomer(${c.id})`, true) : '')}</td></tr>`).join('');
    document.getElementById('cust-table').innerHTML = tableHTML(['Customer', 'Type', 'City', 'Phone', 'Email', '>Total Purchases', '>Actions'], rows, 'No customers match your filters.');
}
function openCustomerModal(id = null) {
    const c = id !== null ? db.customers.find(x => x.id === id) : { name: '', contact: '', email: '', type: db.options.customerTypes[0], city: db.options.cities[0] };
    openModal(id !== null ? 'Edit Customer' : 'Add New Customer', `<form onsubmit="saveCustomer(event,${id === null ? 'null' : id})" class="p-6 space-y-4">
        ${inputF('c-name', 'Customer Name', c.name, 'required')}
        <div class="grid grid-cols-2 gap-4">${selectF('c-type', 'Customer Type', 'customerTypes', c.type)}${selectF('c-city', 'City', 'cities', c.city)}</div>
        <div class="grid grid-cols-2 gap-4">${inputF('c-contact', 'Phone Number', c.contact, 'required placeholder="+977-98..."')}${inputF('c-email', 'Email (optional)', c.email === '-' ? '' : c.email, 'type="email"')}</div>
        ${formButtons('Save Customer')}</form>`);
}
function saveCustomer(e, id) {
    e.preventDefault();
    const type = pickVal('c-type', 'customer type'), city = pickVal('c-city', 'city'); if (!type || !city) return;
    const data = { name: val('c-name').trim(), contact: val('c-contact').trim(), email: val('c-email').trim() || '-', type, city };
    if (id === null) db.customers.push({ id: nextNum(db.customers), purchases: 0, ...data });
    else Object.assign(db.customers.find(x => x.id === id), data);
    saveDatabase(); closeModal(); renderTabContent('customers'); showToast('Customer saved successfully!', 'success');
}
function deleteCustomer(id) {
    if (!requireAdmin()) return;
    if (confirm('Delete this customer?')) { db.customers = db.customers.filter(x => x.id !== id); saveDatabase(); renderTabContent('customers'); showToast('Customer deleted.', 'info'); }
}
