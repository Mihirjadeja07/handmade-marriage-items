// જરૂરી પેકેજ ઇમ્પોર્ટ કરો
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname)));

// --- ફાઇલ અપલોડ સેટઅપ ---
// ... (આ કોડ પહેલા જેવો જ છે) ...

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
// ... (બધા HTML રૂટ્સ પહેલા જેવા જ છે) ...
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

// --- પ્રોડક્ટ ઉમેરવા માટેનું અપડેટેડ API ---
app.post('/api/products', async (req, res) => {
    try {
        // ખાતરી કરો કે ડેટાબેઝ કનેક્ટ થયેલું છે
        if (!db) { 
            return res.status(503).json({ success: false, message: "ડેટાબેઝ હાલ ઉપલબ્ધ નથી." }); 
        }

        const { name, price, unit, image_url } = req.body;

        // વેલિડેશન: ખાતરી કરો કે બધી વિગતો હાજર છે
        if (!name || !price || !unit || !image_url) {
            return res.status(400).json({ success: false, message: 'કૃપા કરીને બધી વિગતો ભરો.' });
        }

        const newProduct = { 
            name, 
            price: {value: parseInt(price), unit}, 
            image_url 
        };
        await db.collection('products').insertOne(newProduct);
        res.status(201).json({ success: true, product: newProduct });
    } catch (e) {
        console.error("પ્રોડક્ટ ઉમેરતી વખતે ભૂલ:", e);
        res.status(500).json({ success: false, message: "પ્રોડક્ટ ઉમેરવામાં આંતરિક ભૂલ આવી." });
    }
});

// બાકીના બધા APIs પહેલા જેવા જ છે...
// ...
app.get('/api/products', async (req, res) => { /* ... */ });
app.post('/api/orders', upload.single('paymentScreenshot'), async (req, res) => { /* ... */ });
app.post('/api/admin/login', (req, res) => { /* ... */ });
app.get('/api/admin/orders', async (req, res) => { /* ... */ });
app.delete('/api/products/:id', async (req, res) => { /* ... */ });
app.put('/api/products/:id', async (req, res) => { /* ... */ });
app.delete('/api/admin/orders/:id', async (req, res) => { /* ... */ });

// સર્વરને ચાલુ કરો
app.listen(port, () => {
    console.log(`Baisa Craft Website is running on port: ${port}`);
});
