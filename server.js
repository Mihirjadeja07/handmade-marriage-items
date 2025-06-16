// જરૂરી પેકેજ ઇમ્પોર્ટ કરો
const express = require('express');
const cors =require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// --- ડેટાબેઝ કનેક્શન ---
const uri = process.env.MONGODB_URI || "mongodb+srv://girfresh_user:Mihir2911@cluster0.nigjo4h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("girfresh_db");
        console.log("MongoDB સાથે સફળતાપૂર્વક કનેક્ટ થયું.");
    } catch (e) {
        console.error("MongoDB સાથે કનેક્ટ કરવામાં નિષ્ફળતા મળી:", e);
    }
}
connectDB();

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname)));

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
const adminCredentials = { email: 'Mihir@girfresh.com', password: 'Mihir@2911' };

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

app.post('/api/orders', async (req, res) => {
    try {
        const orderDetails = req.body;
        const newOrder = {
            orderId: `GF-${Date.now()}`, 
            ...orderDetails,
            timestamp: new Date()
        };
        const result = await db.collection('orders').insertOne(newOrder);
        res.status(201).json({ success: true, message: 'ઓર્ડર સફળતાપૂર્વક લેવાઈ ગયો છે!', orderId: newOrder.orderId });
    } catch (e) {
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
        if (!db) { return res.status(503).json({ message: "ડેટાબેઝ હજુ કનેક્ટ થઈ રહ્યું છે." }); }
        const orders = await db.collection('orders').find().sort({timestamp: -1}).toArray();
        res.json(orders);
    } catch (e) {
        res.status(500).json({ success: false, message: "ઓર્ડર્સ લાવી શકાયા નથી." });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, price, unit, image_url } = req.body;
        const newProduct = { name, price: {value: parseInt(price), unit}, image_url };
        await db.collection('products').insertOne(newProduct);
        res.status(201).json({ success: true, product: newProduct });
    } catch (e) {
        res.status(500).json({ success: false, message: "પ્રોડક્ટ ઉમેરવામાં નિષ્ફળતા મળી." });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        if (!ObjectId.isValid(productId)) return res.status(400).json({ success: false, message: 'અમાન્ય ID.' });
        await db.collection('products').deleteOne({ _id: new ObjectId(productId) });
        res.json({ success: true, message: 'Product deleted' });
    } catch (e) {
        res.status(500).json({ success: false, message: "પ્રોડક્ટ ડિલીટ કરવામાં નિષ્ફળતા મળી." });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        if (!ObjectId.isValid(productId)) return res.status(400).json({ success: false, message: 'અમાન્ય ID.' });

        const { name, price, unit, image_url } = req.body;
        const updatedProductData = { name, price: { value: parseInt(price), unit }, image_url };

        const result = await db.collection('products').updateOne(
            { _id: new ObjectId(productId) },
            { $set: updatedProductData }
        );

        if (result.matchedCount > 0) {
            res.json({ success: true, message: 'પ્રોડક્ટ સફળતાપૂર્વક અપડેટ થઈ ગઈ છે.' });
        } else {
            res.status(404).json({ success: false, message: 'પ્રોડક્ટ મળી નથી.' });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: "પ્રોડક્ટ અપડેટ કરવામાં નિષ્ફળતા મળી." });
    }
});

app.delete('/api/admin/orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        if (!ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: 'અમાન્ય ઓર્ડર ID.' });
        }
        const result = await db.collection('orders').deleteOne({ _id: new ObjectId(orderId) });
        if (result.deletedCount > 0) {
            res.json({ success: true, message: 'ઓર્ડર સફળતાપૂર્વક ડિલીટ થઈ ગયો છે.' });
        } else {
            res.status(404).json({ success: false, message: 'ઓર્ડર મળ્યો નથી.' });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: "ઓર્ડર ડિલીટ કરવામાં નિષ્ફળતા મળી." });
    }
});


app.listen(port, () => {
    console.log(`Gir Fresh Website is running on port: ${port}`);
});
