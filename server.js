// જરૂરી પેકેજ ઇમ્પોર્ટ કરો
const express = require('express');
const cors = require('cors');
const path = require('path');

// Express એપ્લિકેશન બનાવો
const app = express();
const port = 3000;

// Middleware નો ઉપયોગ કરો
app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname))); // સ્ટેટિક ફાઇલો સર્વ કરવા માટે

// HTML પેજને સર્વ કરવા માટેના રૂટ્સ
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/products.html', (req, res) => res.sendFile(path.join(__dirname, 'products.html')));
app.get('/about.html', (req, res) => res.sendFile(path.join(__dirname, 'about.html')));
app.get('/contact.html', (req, res) => res.sendFile(path.join(__dirname, 'contact.html')));
app.get('/cart.html', (req, res) => res.sendFile(path.join(__dirname, 'cart.html')));
app.get('/checkout.html', (req, res) => res.sendFile(path.join(__dirname, 'checkout.html')));
app.get('/order-success.html', (req, res) => res.sendFile(path.join(__dirname, 'order-success.html')));
app.get('/admin/login.html', (req, res) => res.sendFile(path.join(__dirname, 'admin/login.html')));
app.get('/admin/dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'admin/dashboard.html')));

// --- ડેટા સ્ટોરેજ (નકલી ડેટાબેઝ) ---
const adminCredentials = { email: 'Mihir@girfresh.com', password: 'Mihir@2911' };

let products = [
    { id: 1, name: 'ઓર્ગેનિક બટાટા', price: { value: 40, unit: 'કિલો' }, image_url: 'images/farm-fresh-potatoes.jpg' },
    { id: 2, name: 'દેશી ભીંડા', price: { value: 60, unit: '500 ગ્રામ' }, image_url: 'images/fresh-organic-okra.jpg' },
    { id: 3, name: 'ઓર્ગેનિક ઘઉં', price: { value: 55, unit: 'કિલો' }, image_url: 'images/gir-fresh-wheat-field-sunset.jpg' },
    { id: 4, name: 'આખા મસાલા', price: { value: 90, unit: '100 ગ્રામ' }, image_url: 'images/gir-fresh-indian-spices.jpg' },
    { id: 5, name: 'તાજું A2 ગાયનું દૂધ', price: { value: 40, unit: '500 મિલી' }, image_url: 'images/gir-fresh-hand-milking-cow.jpg' },
    { id: 6, name: 'ઘરે જમાવેલું દહીં', price: { value: 50, unit: '400 ગ્રામ' }, image_url: 'images/fresh-set-curd.jpg' }
];
let nextProductId = products.length + 1;

let orders = [];
let nextOrderId = 1;

// ============ APIs ============

// --- Public APIs ---
app.get('/api/products', (req, res) => res.json(products));

app.post('/api/orders', (req, res) => {
    const orderDetails = req.body;
    const newOrder = {
        orderId: nextOrderId++,
        ...orderDetails,
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    };
    orders.push(newOrder);
    console.log("નવો ઓર્ડર મળ્યો:", newOrder);
    res.status(201).json({ success: true, message: 'ઓર્ડર સફળતાપૂર્વક લેવાઈ ગયો છે!' });
});

// --- Admin APIs ---
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email === adminCredentials.email && password === adminCredentials.password) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.get('/api/admin/orders', (req, res) => res.json(orders));

app.post('/api/products', (req, res) => {
    const { name, price, unit, image_url } = req.body;
    const newProduct = { id: nextProductId++, name, price: {value: parseInt(price), unit}, image_url };
    products.push(newProduct);
    res.status(201).json({ success: true, product: newProduct });
});

app.delete('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    products = products.filter(p => p.id !== productId);
    res.json({ success: true, message: 'Product deleted' });
});

// સર્વરને ચાલુ કરો
app.listen(port, () => {
    console.log(`Gir Fresh Website is running on http://localhost:${port}`);
});
