/* Reports */
// --- MODULE 7: REPORTS ---
        function renderReports(container) {
            const totalRev = db.sales.reduce((a, s) => a + s.total, 0);
            const totalOrders = db.sales.length;
            const avgOrder = totalOrders > 0 ? totalRev / totalOrders : 0;

            container.innerHTML = `
                <div class="space-y-6">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <p class="text-xs font-semibold text-slate-500">Total Revenue Summary</p>
                            <h3 class="text-2xl font-bold text-inventro-900 mt-1">${db.settings.currency}${totalRev.toFixed(2)}</h3>
                        </div>
                        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <p class="text-xs font-semibold text-slate-500">Total Sales Transactions</p>
                            <h3 class="text-2xl font-bold text-slate-800 mt-1">${totalOrders}</h3>
                        </div>
                        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <p class="text-xs font-semibold text-slate-500">Average Order Value</p>
                            <h3 class="text-2xl font-bold text-slate-800 mt-1">${db.settings.currency}${avgOrder.toFixed(2)}</h3>
                        </div>
                    </div>

                    <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                        <div class="flex items-center justify-between">
                            <h3 class="font-bold text-sm text-slate-800">Comprehensive Stock & Sales Report</h3>
                            <button onclick="window.print()" class="px-4 py-2 bg-inventro-900 hover:bg-inventro-800 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2">
                                <i class="fa-solid fa-print"></i> Export / Print Report
                            </button>
                        </div>

                        <div class="space-y-4">
                            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Stock Valuation Summary</h4>
                            <div class="overflow-x-auto">
                                <table class="w-full text-left text-xs text-slate-600">
                                    <thead class="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th class="p-3">Product Name</th>
                                            <th class="p-3">Category</th>
                                            <th class="p-3">Quantity</th>
                                            <th class="p-3">Purchase Price</th>
                                            <th class="p-3 text-right">Total Stock Valuation</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        ${db.products.map(p => `
                                            <tr class="hover:bg-slate-50 transition">
                                                <td class="p-3 font-semibold text-slate-800">${p.name}</td>
                                                <td class="p-3 text-slate-500">${p.category}</td>
                                                <td class="p-3 font-medium text-slate-800">${p.quantity}</td>
                                                <td class="p-3 text-slate-500">${db.settings.currency}${p.purchasePrice.toFixed(2)}</td>
                                                <td class="p-3 text-right font-bold text-inventro-900">${db.settings.currency}${(p.quantity * p.purchasePrice).toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
