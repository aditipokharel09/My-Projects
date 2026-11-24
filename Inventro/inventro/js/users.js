/* User & role management (admin only) */
function renderUsers(c) {
    c.innerHTML = `<div class="${PANEL}">
        <div class="flex justify-between items-center gap-3">
            <h3 class="font-bold text-sm text-slate-800">System Users & Roles</h3>
            <button onclick="openUserModal()" class="${BTN}"><i class="fa-solid fa-user-plus"></i> Add New User</button>
        </div>
        ${tableHTML(['Full Name', 'Email / Username', 'Role', 'Status', '>Actions'], db.users.map(u => `<tr class="hover:bg-slate-50 transition">
            <td class="p-3 font-semibold text-slate-800">${esc(u.name)}</td><td class="p-3 text-slate-500">${esc(u.username)}</td>
            <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-semibold ${u.role === 'admin' ? 'bg-inventro-50 text-inventro-900 border border-inventro-200' : 'bg-slate-100 text-slate-700'}">${u.role === 'admin' ? 'Administrator' : 'Staff'}</span></td>
            <td class="p-3"><span class="font-medium ${u.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}">${u.status}</span></td>
            <td class="p-3 text-right space-x-1">${iconBtn('fa-pen', 'Edit user', `openUserModal(${u.id})`)}${iconBtn(u.status === 'Active' ? 'fa-user-slash' : 'fa-user-check', u.status === 'Active' ? 'Deactivate' : 'Activate', `toggleUserStatus(${u.id})`)}</td></tr>`).join(''))}
        <p class="text-[11px] text-slate-500"><b>Staff</b> can sell, manage stock, customers and suppliers. <b>Administrators</b> can also delete records, manage users and change settings & dropdown lists.</p>
    </div>`;
}
function openUserModal(id = null) {
    const u = id !== null ? db.users.find(x => x.id === id) : { name: '', username: '', role: 'staff' };
    openModal(id !== null ? 'Edit User' : 'Add System User', `<form onsubmit="saveUser(event,${id === null ? 'null' : id})" class="p-6 space-y-4">
        ${inputF('u-name', 'Full Name', u.name, 'required')}
        ${inputF('u-username', 'Email / Username', u.username, 'required placeholder="staff@inventro.com"')}
        ${inputF('u-pass', id === null ? 'Password' : 'New Password (leave blank to keep current)', '', id === null ? 'type="password" required' : 'type="password"')}
        <div><label class="${LBL}">Role</label><select id="u-role" class="${INP}">
            <option value="staff" ${u.role === 'staff' ? 'selected' : ''}>Staff — sales & stock</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administrator — full access</option></select></div>
        ${formButtons(id === null ? 'Create User' : 'Save User')}</form>`);
}
function saveUser(e, id) {
    e.preventDefault();
    const username = val('u-username').trim(), role = val('u-role'), pass = val('u-pass').trim();
    if (db.users.some(x => x.id !== id && x.username.toLowerCase() === username.toLowerCase())) { showToast('That username is already used.', 'error'); return; }
    if (id === null) db.users.push({ id: nextNum(db.users), name: val('u-name').trim(), username, password: pass, role, status: 'Active' });
    else {
        const u = db.users.find(x => x.id === id);
        if (u.id === currentUser.id && role !== 'admin') { showToast('You cannot remove your own admin role.', 'error'); return; }
        Object.assign(u, { name: val('u-name').trim(), username, role });
        if (pass) u.password = pass;
        if (u.id === currentUser.id) setupUserRoleUI();
    }
    saveDatabase(); closeModal(); renderTabContent('users'); showToast('User saved successfully!', 'success');
}
function toggleUserStatus(id) {
    const u = db.users.find(x => x.id === id);
    if (u.id === currentUser.id) { showToast('Cannot deactivate your own active session.', 'error'); return; }
    u.status = u.status === 'Active' ? 'Deactivated' : 'Active';
    saveDatabase(); renderTabContent('users'); showToast('User status updated.', 'info');
}
