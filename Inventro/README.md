# Inventro – Inventory & Sales System

Open `index.html` in a browser (needs internet once for the Tailwind / icon / font CDNs). No install or server needed.

**Demo logins** (password `123`): `admin@inventro.com` (Administrator), `staff@inventro.com` (Staff).

## What's new
- **Choose, don't type.** Category, unit, supplier, customer, payment method, customer type, city and stock reasons are all dropdowns with many ready-made options. Every dropdown also has **➕ Add new…** so you can add one on the spot.
- **Settings → Dropdown Lists (admin):** add, rename or remove any option. Renames update existing records; options in use can't be deleted by mistake.
- **Products:** filter by category and stock status, auto product ID, live profit margin, edit stock with a log entry.
- **Inventory:** one-click Stock In / Stock Out with reason dropdown, quick quantity buttons and a before/after preview.
- **POS:** category chips, +/− quantity, discount dropdown, tax from Settings, remembered customer/payment choice, printable receipt.
- **Customers & Suppliers:** edit, filter by type/city, pick supplied categories from chips.
- **Users:** edit users, reset passwords, roles. Staff can't delete records or change settings.
- **Backup / Restore / Reset** in Settings.

## Files
```
index.html            page layout
css/styles.css        styles + print rules
js/tailwind-config.js theme colours
js/data.js            demo data + default dropdown lists
js/core.js            database, dropdown builder, modal, toast
js/auth.js            login, roles, navigation
js/dashboard.js  products.js  inventory.js  pos.js
js/customers.js  suppliers.js  reports.js  users.js  settings.js
js/app.js             startup
```
Data is saved in your browser (localStorage) – use Settings → Download Backup to keep a copy.
