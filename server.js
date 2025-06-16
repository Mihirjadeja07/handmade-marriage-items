const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// --- મુખ્ય ફેરફાર: સ્ટેટિક ફાઇલો સર્વ કરવા માટે ---
// આ લાઇન Express ને કહે છે કે બધી સ્ટેટિક ફાઇલો (HTML, CSS, JS, Images)
// મુખ્ય ફોલ્ડરમાંથી આપમેળે સર્વ કરવાની છે.
app.use(express.static(path.join(__dirname)));

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
        process.exit(1);
    }
}
connectDB();

// ============ APIs ============
const adminCredentials = { email: 'Mihir@girfresh.com', password: 'Mihir@2911' };

// --- Public APIs ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await db.collection('products').find().toArray();
        res.json(products);
    } catch (e) {
        res.status(500).json({ success: false, message: "ડેટાબેઝમાંથી પ્રોડક્ટ્સ લાવી શકાયું નથી." });
    }
});

app.post('/api/orders', async (req, res) => { /* ... કોડ પહેલા જેવો જ છે ... */ });

// --- Admin APIs ---
app.post('/api/admin/login', (req, res) => { /* ... કોડ પહેલા જેવો જ છે ... */ });
app.get('/api/admin/orders', async (req, res) => { /* ... કોડ પહેલા જેવો જ છે ... */ });

app.post('/api/products', async (req, res) => {
    try {
        const { name, price, unit, image_url } = req.body;
        const newProduct = { name, price: {value: parseInt(price), unit}, image_url };
        await db.collection('products').insertOne(newProduct);
        res.status(201).json({ success: true, product: newProduct });
    } catch(e) {
        res.status(500).json({ success: false, message: "પ્રોડક્ટ ઉમેરવામાં નિષ્ફળતા મળી." });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        if (!ObjectId.isValid(productId)) return res.status(400).json({ success: false, message: 'અમાન્ય ID.' });
        await db.collection('products').deleteOne({ _id: new ObjectId(productId) });
        res.json({ success: true, message: 'Product deleted' });
    } catch(e) {
        res.status(500).json({ success: false, message: "પ્રોડક્ટ ડિલીટ કરવામાં નિષ્ફળતા મળી." });
    }
});

app.put('/api/products/:id', async (req, res) => { /* ... કોડ પહેલા જેવો જ છે ... */ });


// --- HTML પેજને સર્વ કરવા માટેના રૂટ્સ ---
// આ રૂટ્સ ખાતરી કરે છે કે સીધા URL પર જવાથી પણ પેજ ખુલે
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// સર્વરને ચાલુ કરો
app.listen(port, () => {
    console.log(`Gir Fresh Website is running on port: ${port}`);
});
