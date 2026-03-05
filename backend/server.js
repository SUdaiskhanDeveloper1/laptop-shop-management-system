import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import laptopsRoutes from './routes/laptops.js';
import purchasesRoutes from './routes/purchases.js';
import salesRoutes from './routes/sales.js';
import suppliersRoutes from './routes/suppliers.js';
import expensesRoutes from './routes/expenses.js';
import additionalSalesRoutes from './routes/additionalSales.js';
import { auth } from './middleware/auth.js';
import { ObjectId } from 'mongodb';

dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175'],
  credentials: true
}));
app.use(express.json());


app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/laptop-shop')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

app.get('/api/test', (req, res) => res.json({ message: 'API is working' }));

app.use('/api/auth', authRoutes);
app.use('/api/laptops', laptopsRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/additional_sales', additionalSalesRoutes);

app.use('/api/collections/:name', auth, (req, res, next) => {
  req.collection = mongoose.connection.db.collection(req.params.name);
  next();
});


app.get('/api/collections/:name', auth, async (req, res) => {
  try {
    const docs = await req.collection.find({}).sort({ createdAt: -1 }).toArray();
    const formattedDocs = docs.map(doc => {
      doc.id = doc._id.toString();
      delete doc._id;
      return doc;
    });
    res.json(formattedDocs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/collections/:name/:id', auth, async (req, res) => {
  try {
    const doc = await req.collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    doc.id = doc._id.toString();
    delete doc._id;
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/collections/:name', auth, async (req, res) => {
  try {
    const docData = { ...req.body };
    if (!docData.createdAt) docData.createdAt = new Date().toISOString();
    const result = await req.collection.insertOne(docData);
    res.status(201).json({ id: result.insertedId.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/collections/:name/:id', auth, async (req, res) => {
  try {
    const updateDoc = { ...req.body };
    delete updateDoc.id; 
    delete updateDoc._id; 
    await req.collection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateDoc });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/collections/:name/:id', auth, async (req, res) => {
  try {
    await req.collection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api', (req, res) => {
  console.log(`404: Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found on this server.` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
