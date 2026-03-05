import express from 'express';
import Purchase from '../models/Purchase.js';
import Laptop from '../models/Laptop.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const purchaseData = { ...req.body, createdAt: new Date().toISOString() };
    const purchase = new Purchase(purchaseData);
    await purchase.save();

    // Increment laptop quantity
    if (purchaseData.laptopId) {
        const laptop = await Laptop.findById(purchaseData.laptopId);
        if (laptop) {
            const currentQty = Number(laptop.get('quantity')) || 0;
            const purchaseQty = Number(purchaseData.quantity) || 0;
            laptop.set('quantity', currentQty + purchaseQty);
            await laptop.save();
        }
    }

    res.status(201).json({ id: purchase._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
    try {
        const oldPurchase = await Purchase.findById(req.params.id);
        if (!oldPurchase) return res.status(404).json({ error: 'Purchase not found' });

        const newPurchaseData = req.body;
        await Purchase.findByIdAndUpdate(req.params.id, newPurchaseData);

        // Adjust laptop quantity
        if (oldPurchase.laptopId === newPurchaseData.laptopId) {
            const diff = (Number(newPurchaseData.quantity) || 0) - (Number(oldPurchase.quantity) || 0);
            if (diff !== 0) {
                const laptop = await Laptop.findById(newPurchaseData.laptopId);
                if (laptop) {
                    const currentQty = Number(laptop.get('quantity')) || 0;
                    laptop.set('quantity', currentQty + diff);
                    await laptop.save();
                }
            }
        } else {
            // Restore old laptop and increment new one
            const oldLaptop = await Laptop.findById(oldPurchase.laptopId);
            if (oldLaptop) {
                oldLaptop.set('quantity', (Number(oldLaptop.get('quantity')) || 0) - (Number(oldPurchase.quantity) || 0));
                await oldLaptop.save();
            }
            const newLaptop = await Laptop.findById(newPurchaseData.laptopId);
            if (newLaptop) {
                newLaptop.set('quantity', (Number(newLaptop.get('quantity')) || 0) + (Number(newPurchaseData.quantity) || 0));
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
    const purchase = await Purchase.findById(req.params.id);
    if (purchase && purchase.laptopId) {
        const laptop = await Laptop.findById(purchase.laptopId);
        if (laptop) {
            const currentQty = Number(laptop.get('quantity')) || 0;
            laptop.set('quantity', currentQty - (Number(purchase.quantity) || 0));
            await laptop.save();
        }
    }
    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
