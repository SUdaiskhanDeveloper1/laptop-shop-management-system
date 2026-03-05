import express from 'express';
import AdditionalSale from '../models/AdditionalSale.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const sales = await AdditionalSale.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const sale = await AdditionalSale.findById(req.params.id);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const sale = new AdditionalSale({ ...req.body, createdAt: new Date().toISOString() });
    await sale.save();
    res.status(201).json({ id: sale._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await AdditionalSale.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await AdditionalSale.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
