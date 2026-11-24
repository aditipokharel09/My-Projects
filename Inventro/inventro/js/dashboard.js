/* Dashboard */
// --- MODULE 1: DASHBOARD ---
        function renderDashboard(container) {
            const totalProducts = db.products.length;
            const availableStock = db.products.reduce((acc, p) => acc + p.quantity, 0);
            const lowStockItems = db.products.filter(p => p.quantity <= db.settings.lowStockThreshold).length;
            const todaySalesCount = db.sales.length;
            const totalRevenue = db.sales.reduce((acc, s) => acc + s.total, 0);

            container.innerHTML = `
                <!-- Metrics Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p class="text-xs font-medium text-slate-500">Total Products</p>
                            <h3 class="text-2xl font-bold text-slate-800 mt-1">${totalProducts}</h3>
                        </div>
                        <div class="w-12 h-12 rounded-xl bg-inventro-50 border border-inventro-100 text-inventro-900 flex items-center justify-center text-xl">
                            <i class="fa-solid fa-box-open"></i>
                        </div>
                    </div>
                    <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p class="text-xs font-medium text-slate-500">Available Stock</p>
                            <h3 class="text-2xl font-bold text-slate-800 mt-1">${availableStock}</h3>
                        </div>
                        <div class="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                            <i class="fa-solid fa-cubes"></i>
                        </div>
                    </div>
                    <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p class="text-xs font-medium text-slate-500">Low Stock Items</p>
                            <h3 class="text-2xl font-bold text-amber-600 mt-1">${lowStockItems}</h3>
                        </div>
                        <div class="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center text-xl">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                        </div>
                    </div>
                    <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p class="text-xs font-medium text-slate-500">Total Orders</p>
                            <h3 class="text-2xl font-bold text-slate-800 mt-1">${todaySalesCount}</h3>
                        </div>
                        <div class="w-12 h-12 rounded-xl bg-inventro-50 border border-inventro-100 text-inventro-900 flex items-center justify-center text-xl">
                            <i class="fa-solid fa-receipt"></i>
                        </div>
                    </div>
                    <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p class="text-xs font-medium text-slate-500">Total Revenue</p>
                            <h3 class="text-2xl font-bold text-inventro-900 mt-1">${db.settings.currency}${totalRevenue.toFixed(2)}</h3>
                        </div>
                        <div class="w-12 h-12 rounded-xl bg-inventro-50 border border-inventro-100 text-inventro-900 flex items-center justify-center text-xl">
                            <i class="fa-solid fa-wallet"></i>
                        </div>
                    </div>
                </div>

                <!-- Charts & Alerts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-bold text-sm text-slate-800">Weekly Sales Performance Overview</h3>
                            <span class="text-xs text-inventro-900 bg-inventro-50 px-3 py-1 rounded-lg border border-inventro-100 font-medium">Recent 7 Days</span>
                        </div>
                        <div class="flex-1 flex items-end gap-3 h-64 pt-6 pb-2 px-2 border-b border-slate-100">
                            <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                <span class="text-[10px] text-slate-500 font-semibold">${db.settings.currency}240</span>
                                <div class="w-full bg-inventro-200 hover:bg-inventro-800 rounded-t-lg transition h-[45%]"></div>
                                <span class="text-xs text-slate-600 font-medium">Sun</span>
                            </div>
                            <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                <span class="text-[10px] text-slate-500 font-semibold">${db.settings.currency}450</span>
                                <div class="w-full bg-inventro-200 hover:bg-inventro-800 rounded-t-lg transition h-[65%]"></div>
                                <span class="text-xs text-slate-600 font-medium">Mon</span>
                            </div>
                            <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                <span class="text-[10px] text-slate-500 font-semibold">${db.settings.currency}320</span>
                                <div class="w-full bg-inventro-200 hover:bg-inventro-800 rounded-t-lg transition h-[55%]"></div>
                                <span class="text-xs text-slate-600 font-medium">Tue</span>
                            </div>
                            <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                <span class="text-[10px] text-slate-500 font-semibold">${db.settings.currency}680</span>
                                <div class="w-full bg-inventro-900 hover:bg-inventro-800 rounded-t-lg transition h-[90%]"></div>
                                <span class="text-xs text-slate-600 font-medium">Wed</span>
                            </div>
                            <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                <span class="text-[10px] text-slate-500 font-semibold">${db.settings.currency}510</span>
                                <div class="w-full bg-inventro-200 hover:bg-inventro-800 rounded-t-lg transition h-[70%]"></div>
                                <span class="text-xs text-slate-600 font-medium">Thu</span>
                            </div>
                            <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                <span class="text-[10px] text-slate-500 font-semibold">${db.settings.currency}790</span>
                                <div class="w-full bg-inventro-900 hover:bg-inventro-800 rounded-t-lg transition h-[100%]"></div>
                                <span class="text-xs text-slate-600 font-medium">Fri</span>
                            </div>
                            <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                <span class="text-[10px] text-slate-500 font-semibold">${db.settings.currency}380</span>
                                <div class="w-full bg-inventro-200 hover:bg-inventro-800 rounded-t-lg transition h-[50%]"></div>
                                <span class="text-xs text-slate-600 font-medium">Sat</span>
                            </div>
                        </div>
                    </div>

                    <!-- Low Stock Alerts -->
                    <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-bold text-sm text-slate-800">Low Stock Warnings</h3>
                            <span class="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-semibold">${lowStockItems} items</span>
                        </div>
                        <div class="flex-1 overflow-y-auto space-y-3 pr-1 max-h-64">
                            ${db.products.filter(p => p.quantity <= db.settings.lowStockThreshold).map(p => `
                                <div class="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p class="text-xs font-semibold text-slate-800">${p.name}</p>
                                        <p class="text-[11px] text-amber-700 mt-0.5">Stock Left: <span class="font-bold">${p.quantity}</span></p>
                                    </div>
                                    <button onclick="openStockModal('${p.id}')" class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-medium rounded-lg transition">Restock</button>
                                </div>
                            `).join('') || '<p class="text-xs text-slate-400 text-center py-10">All product inventory levels are healthy.</p>'}
                        </div>
                    </div>
                </div>

                <!-- Recent Sales Table -->
                <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-sm text-slate-800">Recent Sales Transactions</h3>
                        <button onclick="switchTab('pos')" class="text-xs text-inventro-900 hover:text-inventro-700 font-semibold">View POS / Make Sale <i class="fa-solid fa-arrow-right ml-1"></i></button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs text-slate-600">
                            <thead class="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                                <tr>
                                    <th class="p-3">Invoice ID</th>
                                    <th class="p-3">Date & Time</th>
                                    <th class="p-3">Customer</th>
                                    <th class="p-3">Payment</th>
                                    <th class="p-3 text-right">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${db.sales.slice(-5).reverse().map(s => `
                                    <tr class="hover:bg-slate-50 transition">
                                        <td class="p-3 font-semibold text-slate-800">${s.id}</td>
                                        <td class="p-3 text-slate-500">${s.date}</td>
                                        <td class="p-3 font-medium text-slate-700">${s.customer}</td>
                                        <td class="p-3"><span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 font-medium">${s.payment}</span></td>
                                        <td class="p-3 text-right font-bold text-inventro-900">${db.settings.currency}${s.total.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
