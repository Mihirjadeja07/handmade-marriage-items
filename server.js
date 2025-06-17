// જરૂરી પેકેજ ઇમ્પોર્ટ કરો
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer'); // ફાઇલ અપલોડ માટે
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname)));

// --- ફાઇલ અપલોડ સેટઅપ ---
// અપલોડ કરેલા સ્ક્રીનશોટને 'uploads/' ફોલ્ડરમાં સેવ કરવા માટે
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // ફાઇલનું નામ યુનિક રાખવા માટે સમય અને ઓરિજિનલ નામનો ઉપયોગ કરો
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });


// --- ડેટાબેઝ કનેક્શન ---
const uri = process.env.MONGODB_URI || "mongodb+srv://YOUR_MONGO_USER:YOUR_MONGO_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("baisacraft_db"); // નવા પ્રોજેક્ટ માટે નવો ડેટાબેઝ
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

// --- ડેટા ---
const adminCredentials = { email: 'baisa@admin.com', password: 'baisa@2025' };


// ============ APIs ============

// Public APIs
app.get('/api/products', async (req, res) => {
    try {
        if (!db) { return res.status(503).json({ message: "ડેટાબેઝ કનેક્ટ થઈ રહ્યું છે." }); }
        const products = await db.collection('products').find().toArray();
        res.json(products);
    } catch (e) {
        res.status(500).json({ success: false, message: "ડેટાબેઝમાંથી પ્રોડક્ટ્સ લાવી શકાયું નથી." });
    }
});

// ઓર્ડર માટે નવું API જે ફાઇલ અપલોડ પણ સંભાળશે
app.post('/api/orders', upload.single('paymentScreenshot'), async (req, res) => {
    try {
        if (!db) { return res.status(503).json({ message: "ડેટાબેઝ કનેક્ટ થઈ રહ્યું છે." }); }
        
        const customerDetails = JSON.parse(req.body.customer);
        const cartItems = JSON.parse(req.body.items);
        const total = req.body.total;
        
        const newOrder = {
            orderId: `BC-${Date.now()}`,
            customer: customerDetails,
            items: cartItems,
            total: total,
            payment: {
                upiId: req.body.upiId,
                screenshotPath: req.file.path // અપલોડ થયેલા સ્ક્રીનશોટનો પાથ
            },
            status: 'ચકાસણી બાકી', // નવું સ્ટેટસ
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
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email === adminCredentials.email && password === adminCredentials.password) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.get('/api/admin/orders', async (req, res) => {
    try {
        if (!db) { return res.status(503).json({ message: "ડેટાબેઝ કનેક્ટ થઈ રહ્યું છે." }); }
        const orders = await db.collection('orders').find().sort({timestamp: -1}).toArray();
        res.json(orders);
    } catch (e) {
        res.status(500).json({ success: false, message: "ઓર્ડર્સ લાવી શકાયા નથી." });
    }
});

// સર્વરને ચાલુ કરો
app.listen(port, () => {
    console.log(`Baisa Craft Website is running on port: ${port}`);
});
