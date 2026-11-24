/* Login, logout, role UI and tab navigation */
function fillDemoCredentials(type) {
            if (type === 'admin') {
                document.getElementById('login-username').value = 'admin@inventro.com';
                document.getElementById('login-password').value = '123';
            } else {
                document.getElementById('login-username').value = 'staff@inventro.com';
                document.getElementById('login-password').value = '123';
            }
        }

        function handleLogin(e) {
            e.preventDefault();
            const u = document.getElementById('login-username').value.trim();
            const p = document.getElementById('login-password').value.trim();
            const errEl = document.getElementById('login-error');

            const foundUser = db.users.find(x => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
            if (foundUser) {
                if (foundUser.status === 'Deactivated') {
                    errEl.textContent = 'This account has been deactivated.';
                    errEl.classList.remove('hidden');
                    return;
                }
                currentUser = foundUser;
                errEl.classList.add('hidden');
                document.getElementById('login-view').classList.add('hidden');
                document.getElementById('main-view').classList.remove('hidden');
                setupUserRoleUI();
                switchTab('dashboard');
                showToast(`Welcome back, ${currentUser.name}!`, 'success');
            } else {
                errEl.textContent = 'Invalid username/email or password.';
                errEl.classList.remove('hidden');
            }
        }

        function handleLogout() {
            currentUser = null;
            document.getElementById('main-view').classList.add('hidden');
            document.getElementById('login-view').classList.remove('hidden');
            document.getElementById('login-form').reset();
            showToast('Logged out successfully.', 'info');
        }

        function setupUserRoleUI() {
            document.getElementById('user-name-display').textContent = currentUser.name;
            document.getElementById('user-role-display').textContent = currentUser.role.toUpperCase();
            document.getElementById('user-avatar').textContent = currentUser.name.charAt(0).toUpperCase();

            const usersNavBtn = document.getElementById('nav-users');
            if (currentUser.role !== 'admin') {
                usersNavBtn.style.display = 'none';
            } else {
                usersNavBtn.style.display = 'flex';
            }
        }

        function switchTab(tabId) {
            if (tabId === 'users' && currentUser.role !== 'admin') {
                showToast('Access Denied: Administrator privileges required.', 'error');
                return;
            }
            activeTab = tabId;
            document.querySelectorAll('.nav-btn').forEach(btn => {
                if (btn.dataset.tab === tabId) {
                    btn.classList.add('bg-inventro-900', 'text-white', 'shadow');
                    btn.classList.remove('text-slate-300');
                } else {
                    btn.classList.remove('bg-inventro-900', 'text-white', 'shadow');
                    btn.classList.add('text-slate-300');
                }
            });

            const titles = {
                dashboard: 'Dashboard Overview',
                products: 'Product Catalog & Inventory',
                inventory: 'Stock Management & History',
                pos: 'Sales / Point of Sale (POS)',
                customers: 'Customer Directory',
                suppliers: 'Supplier Directory',
                reports: 'Business Analytics & Reports',
                users: 'User & Role Management',
                settings: 'System Settings'
            };
            document.getElementById('page-title').textContent = titles[tabId] || 'Dashboard';
            renderTabContent(tabId);
        }

        function renderTabContent(tabId) {
            const container = document.getElementById('content-container');
            container.innerHTML = '';

            switch (tabId) {
                case 'dashboard': renderDashboard(container); break;
                case 'products': renderProducts(container); break;
                case 'inventory': renderInventory(container); break;
                case 'pos': renderPOS(container); break;
                case 'customers': renderCustomers(container); break;
                case 'suppliers': renderSuppliers(container); break;
                case 'reports': renderReports(container); break;
                case 'users': renderUsers(container); break;
                case 'settings': renderSettings(container); break;
            }
        }
