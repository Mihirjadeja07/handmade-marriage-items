// જરૂરી પેકેજ ઇમ્પોર્ટ કરો
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config(); // Environment Variables માટે

const app = express();
// Render પોર્ટ આપશે, નહીંતર લોકલ માટે 3000 નો ઉપયોગ થશે
const port = process.env.PORT || 3000; 

// --- ડેટાબેઝ કનેક્શન ---
// કનેક્શન સ્ટ્રિંગ હવે Environment Variable માંથી આવશે
const uri = process.env.MONGODB_URI; 
if (!uri) {
    console.error("MONGODB_URI environment variable is not set!");
    process.exit(1);
}

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

// --- API Endpoints ---
const adminCredentials = { email: 'Mihir@girfresh.com', password: 'Mihir@2911' };

// Public APIs
app.get('/api/products', async (req, res) => {
    const products = await db.collection('products').find().toArray();
    res.json(products);
});
// ... બાકીના બધા APIs પહેલા જેવા જ છે ...

// Admin APIs
app.post('/api/admin/login', (req, res) => { /* ... કોડ પહેલા જેવો જ છે ... */ });
app.get('/api/admin/orders', async (req, res) => { /* ... કોડ પહેલા જેવો જ છે ... */ });
app.post('/api/products', async (req, res) => { /* ... કોડ પહેલા જેવો જ છે ... */ });
app.delete('/api/products/:id', async (req, res) => { /* ... કોડ પહેલા જેવો જ છે ... */ });
app.put('/api/products/:id', async (req, res) => { /* ... કોડ પહેલા જેવો જ છે ... */ });

// સર્વરને ચાલુ કરો
app.listen(port, () => {
    console.log(`Gir Fresh Website is running on http://localhost:${port}`);
});
