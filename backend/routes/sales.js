import express from 'express';
import Sale from '../models/Sale.js';
import Laptop from '../models/Laptop.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const saleData = { ...req.body, createdAt: new Date().toISOString() };
    const sale = new Sale(saleData);
    await sale.save();

    if (saleData.laptopId) {
      const laptop = await Laptop.findById(saleData.laptopId);
      if (laptop) {
        const currentQty = Number(laptop.get('quantity')) || 0;
        const saleQty = Number(saleData.quantity) || 0;
        laptop.set('quantity', currentQty - saleQty);
        await laptop.save();
      }
    }

    res.status(201).json({ id: sale._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const oldSale = await Sale.findById(req.params.id);
    if (!oldSale) return res.status(404).json({ error: 'Sale not found' });

    const newSaleData = req.body;
    await Sale.findByIdAndUpdate(req.params.id, newSaleData);

    if (oldSale.laptopId === newSaleData.laptopId) {
      const diff = (Number(newSaleData.quantity) || 0) - (Number(oldSale.quantity) || 0);
      if (diff !== 0) {
        const laptop = await Laptop.findById(newSaleData.laptopId);
        if (laptop) {
          const currentQty = Number(laptop.get('quantity')) || 0;
          laptop.set('quantity', currentQty - diff);
          await laptop.save();
        }
      }
    } else {
        const oldLaptop = await Laptop.findById(oldSale.laptopId);
        if (oldLaptop) {
            oldLaptop.set('quantity', (Number(oldLaptop.get('quantity')) || 0) + (Number(oldSale.quantity) || 0));
            await oldLaptop.save();
        }
        const newLaptop = await Laptop.findById(newSaleData.laptopId);
        if (newLaptop) {
            newLaptop.set('quantity', (Number(newLaptop.get('quantity')) || 0) - (Number(newSaleData.quantity) || 0));
            await newLaptop.save();
        }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (sale && sale.laptopId) {
        const laptop = await Laptop.findById(sale.laptopId);
        if (laptop) {
            const currentQty = Number(laptop.get('quantity')) || 0;
            laptop.set('quantity', currentQty + (Number(sale.quantity) || 0));
            await laptop.save();
        }
    }
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
