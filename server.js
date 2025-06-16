const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

// --- ડેટાબેઝ કનેક્શન ---
const uri = "mongodb+srv://girfresh_user:Mihir2911@cluster0.nigjo4h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
let db;

async function connectDB() { /* ... કોડ પહેલા જેવો જ છે ... */ }
connectDB();

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname)));

// HTML Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
// ... બાકીના બધા HTML રૂટ્સ અહીં ...

// --- API Endpoints ---
const adminCredentials = { email: 'Mihir@girfresh.com', password: 'Mihir@2911' };

// Public APIs
app.get('/api/products', async (req, res) => { /* ... કોડ પહેલા જેવો જ છે ... */ });
app.post('/api/orders', async (req, res) => { /* ... કોડ પહેલા જેવો જ છે ... */ });

// Admin APIs
app.post('/api/admin/login', (req, res) => { /* ... કોડ પહેલા જેવો જ છે ... */ });
app.get('/api/admin/orders', async (req, res) => { /* ... કોડ પહેલા જેવો જ છે ... */ });
app.post('/api/products', async (req, res) => { /* ... કોડ પહેલા જેવો જ છે ... */ });

// પ્રોડક્ટ એડિટ/અપડેટ કરવા માટેનું નવું API (PUT)
app.put('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    const { name, price, unit, image_url } = req.body;
    
    // ખાતરી કરો કે ID સાચું છે
    if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: 'અમાન્ય પ્રોડક્ટ ID.' });
    }

    const updatedProductData = {
        name,
        price: { value: parseInt(price), unit },
        image_url
    };

    const result = await db.collection('products').updateOne(
        { _id: new ObjectId(productId) },
        { $set: updatedProductData }
    );

    if (result.matchedCount > 0) {
        res.json({ success: true, message: 'પ્રોડક્ટ સફળતાપૂર્વક અપડેટ થઈ ગઈ છે.' });
    } else {
        res.status(404).json({ success: false, message: 'પ્રોડક્ટ મળી નથી.' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: 'અમાન્ય પ્રોડક્ટ ID.' });
    }
    await db.collection('products').deleteOne({ _id: new ObjectId(productId) });
    res.json({ success: true, message: 'Product deleted' });
});


// સર્વરને ચાલુ કરો
app.listen(port, () => {
    console.log(`Gir Fresh Website is running on http://localhost:${port}`);
});
