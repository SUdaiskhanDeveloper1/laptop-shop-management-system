import express from 'express';
import Laptop from '../models/Laptop.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const laptops = await Laptop.find().sort({ createdAt: -1 });
    res.json(laptops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const laptop = await Laptop.findById(req.params.id);
    if (!laptop) return res.status(404).json({ error: 'Laptop not found' });
    res.json(laptop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const laptop = new Laptop({ ...req.body, createdAt: new Date().toISOString() });
    await laptop.save();
    res.status(201).json({ id: laptop._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await Laptop.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Laptop.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
