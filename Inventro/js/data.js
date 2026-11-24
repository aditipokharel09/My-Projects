/* Demo data + default dropdown options */
const INITIAL_DB = {
            users: [
                { id: 1, name: 'System Administrator', username: 'admin@inventro.com', role: 'admin', password: '123', status: 'Active' },
                { id: 2, name: 'Store Staff (John)', username: 'staff@inventro.com', role: 'staff', password: '123', status: 'Active' }
            ],
            products: [
                { id: 'PRD-001', name: 'Wireless Ergonomic Keyboard', category: 'Electronics', sellingPrice: 75.00, purchasePrice: 45.00, quantity: 38, supplier: 'TechSupply Nepal', status: 'In Stock' },
                { id: 'PRD-002', name: 'Optical Gaming Mouse RGB', category: 'Electronics', sellingPrice: 35.00, purchasePrice: 20.00, quantity: 6, supplier: 'TechSupply Nepal', status: 'Low Stock' },
                { id: 'PRD-003', name: '27-inch 4K IPS Monitor', category: 'Electronics', sellingPrice: 340.00, purchasePrice: 260.00, quantity: 12, supplier: 'Visionary Displays', status: 'In Stock' },
                { id: 'PRD-004', name: 'Adjustable Aluminium Laptop Stand', category: 'Accessories', sellingPrice: 45.00, purchasePrice: 22.00, quantity: 4, supplier: 'Global Imports', status: 'Low Stock' },
                { id: 'PRD-005', name: 'Ergonomic Executive Office Chair', category: 'Furniture', sellingPrice: 220.00, purchasePrice: 150.00, quantity: 8, supplier: 'OfficePro Furnishings', status: 'In Stock' },
                { id: 'PRD-006', name: 'USB-C Multiport Hub Adapter', category: 'Accessories', sellingPrice: 50.00, purchasePrice: 28.00, quantity: 0, supplier: 'TechSupply Nepal', status: 'Out of Stock' }
            ],
            suppliers: [
                { id: 1, name: 'TechSupply Nepal', contact: '+977-1-4221190', email: 'orders@techsupply.com.np', products: 'Keyboards, Mouse, Hubs' },
                { id: 2, name: 'Visionary Displays', contact: '+977-1-5542291', email: 'sales@visionary.com.np', products: 'Monitors, Screens' },
                { id: 3, name: 'Global Imports', contact: '+977-1-4478832', email: 'info@globalimports.np', products: 'Laptop Stands, Accessories' },
                { id: 4, name: 'OfficePro Furnishings', contact: '+977-1-5261199', email: 'support@officepro.np', products: 'Chairs, Desks' }
            ],
            customers: [
                { id: 1, name: 'Himalayan Tech Solutions', contact: '+977-9841234567', email: 'procurement@himalayantech.com', purchases: 1420.00 },
                { id: 2, name: 'Everest IT Consultancy', contact: '+977-9802345678', email: 'admin@everestit.com.np', purchases: 890.00 },
                { id: 3, name: 'Sunita Sharma', contact: '+977-9851122334', email: 'sunita.sharma@gmail.com', purchases: 340.00 }
            ],
            sales: [
                { id: 'INV-2026-001', date: '2026-09-05 11:20', customer: 'Himalayan Tech Solutions', total: 450.00, payment: 'Bank Transfer', items: 3, cashier: 'Store Staff (John)' },
                { id: 'INV-2026-002', date: '2026-09-06 14:15', customer: 'Sunita Sharma', total: 75.00, payment: 'Cash', items: 1, cashier: 'System Administrator' },
                { id: 'INV-2026-003', date: '2026-09-07 09:45', customer: 'Everest IT Consultancy', total: 680.00, payment: 'Mobile Payment', items: 2, cashier: 'Store Staff (John)' }
            ],
            inventoryLogs: [
                { id: 1, date: '2026-09-01 10:00', product: 'Wireless Ergonomic Keyboard', type: 'Stock In', qty: 50, reference: 'PO-901' },
                { id: 2, date: '2026-09-05 11:20', product: 'Optical Gaming Mouse RGB', type: 'Stock Out', qty: -3, reference: 'INV-2026-001' },
                { id: 3, date: '2026-09-07 09:45', product: '27-inch 4K IPS Monitor', type: 'Stock Out', qty: -2, reference: 'INV-2026-003' }
            ],
            settings: {
                storeName: 'Inventro Academic Store',
                currency: 'Rs. ',
                taxRate: 13,
                lowStockThreshold: 5
            }
        };

/* Default dropdown choices. Admin can add / rename / remove these in Settings. */
const DEFAULT_OPTIONS = {
    categories: ['Electronics', 'Accessories', 'Furniture', 'Computers & Laptops', 'Mobile & Tablets', 'Networking', 'Audio & Video', 'Printers & Ink', 'Stationery', 'Books', 'Groceries', 'Beverages', 'Snacks', 'Clothing', 'Footwear', 'Cosmetics', 'Medicine & Health', 'Home Appliances', 'Kitchenware', 'Hardware & Tools', 'Toys & Games', 'Sports & Fitness', 'Automotive', 'Packaging', 'Other'],
    units: ['Piece', 'Box', 'Pack', 'Set', 'Pair', 'Dozen', 'Kg', 'Gram', 'Litre', 'Ml', 'Meter', 'Roll', 'Bottle', 'Carton'],
    paymentMethods: ['Cash', 'Mobile Payment', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'Pay Later (Credit)'],
    customerTypes: ['Individual', 'Business', 'Wholesale', 'Retail', 'Student', 'Government', 'NGO / Institution'],
    cities: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Biratnagar', 'Birgunj', 'Butwal', 'Dharan', 'Hetauda', 'Janakpur', 'Nepalgunj', 'Other'],
    stockInReasons: ['Purchase from supplier', 'Customer return', 'Opening stock', 'Stock correction', 'Transfer in', 'Free / bonus stock'],
    stockOutReasons: ['Damaged', 'Expired', 'Lost / theft', 'Used internally', 'Returned to supplier', 'Stock correction', 'Free sample']
};
