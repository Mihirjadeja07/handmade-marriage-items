// જરૂરી પેકેજ ઇમ્પોર્ટ કરો
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
// const multer = require('multer'); // << multer ની હવે જરૂર નથી
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname)));

// --- ડેટાબેઝ કનેક્શન ---
const uri = process.env.MONGODB_URI || "mongodb+srv://girfresh_user:Mihir2911@cluster0.nigjo4h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("baisacraft_db"); 
        console.log("MongoDB સાથે સફળતાપૂર્વક કનેક્ટ થયું.");
    } catch (e) {
        console.error("MongoDB સાથે કનેક્ટ કરવામાં નિષ્ફળતા મળી:", e);
    }
}
connectDB();

// HTML Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/products.html', (req, res) => res.sendFile(path.join(__dirname, 'products.html')));
app.get('/about.html', (req, res) => res.sendFile(path.join(__dirname, 'about.html')));
app.get('/contact.html', (req, res) => res.sendFile(path.join(__dirname, 'contact.html')));
app.get('/cart.html', (req, res) => res.sendFile(path.join(__dirname, 'cart.html')));
app.get('/checkout.html', (req, res) => res.sendFile(path.join(__dirname, 'checkout.html')));
app.get('/order-success.html', (req, res) => res.sendFile(path.join(__dirname, 'order-success.html')));
app.get('/admin/login.html', (req, res) => res.sendFile(path.join(__dirname, 'admin/login.html')));
app.get('/admin/dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'admin/dashboard.html')));

// --- APIs ---
const adminCredentials = { email: 'baisa@admin.com', password: 'baisa@2025' };

// Public APIs
app.get('/api/products', async (req, res) => {
    try {
        if (!db) { return res.status(503).json({ message: "ડેટાબેઝ હજુ કનેક્ટ થઈ રહ્યું છે." }); }
        const products = await db.collection('products').find().toArray();
        res.json(products);
    } catch (e) {
        res.status(500).json({ success: false, message: "ડેટાબેઝમાંથી પ્રોડક્ટ્સ લાવી શકાયું નથી." });
    }
});

// =========================================================
//                  ફેરફાર અહીં કર્યો છે
// ઓર્ડર માટેનું અપડેટેડ API (હવે FormData ને બદલે JSON લેશે)
// =========================================================
app.post('/api/orders', async (req, res) => {
    try {
        if (!db) { return res.status(503).json({ message: "ડેટાબેઝ કનેક્ટ થઈ રહ્યું છે." }); }
        
        const orderDetails = req.body;
        
        const newOrder = {
            orderId: `BC-${Date.now()}`,
            customer: orderDetails.customer,
            items: orderDetails.items,
            total: orderDetails.total,
            payment: {
                upiId: orderDetails.payment.upiId
            },
            status: 'ચકાસણી બાકી',
            timestamp: new Date()
        };

        const result = await db.collection('orders').insertOne(newOrder);
        res.status(201).json({ success: true, message: 'ઓર્ડર સફળતાપૂર્વક લેવાઈ ગયો છે!', orderId: newOrder.orderId });
    } catch (e) {
        console.error("Order submission error:", e);
        res.status(500).json({ success: false, message: "ઓર્ડર સેવ કરવામાં નિષ્ફળતા મળી." });
    }
});


// Admin APIs
app.post('/api/admin/login', (req, res) => { /* ... પહેલા જેવો જ કોડ ... */ });
app.get('/api/admin/orders', async (req, res) => { /* ... પહેલા જેવો જ કોડ ... */ });
app.post('/api/products', async (req, res) => { /* ... પહેલા જેવો જ કોડ ... */ });
app.delete('/api/products/:id', async (req, res) => { /* ... પહેલા જેવો જ કોડ ... */ });
app.put('/api/products/:id', async (req, res) => { /* ... પહેલા જેવો જ કોડ ... */ });
app.delete('/api/admin/orders/:id', async (req, res) => { /* ... પહેલા જેવો જ કોડ ... */ });


// સર્વરને ચાલુ કરો
app.listen(port, () => {
    console.log(`Baisa Craft Website is running on port: ${port}`);
});
