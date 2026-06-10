import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import prisma from '../utils/db';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken as any);

// Get all bills
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bills = await prisma.bill.findMany({
      where: { userId: req.userId },
      orderBy: { dueDate: 'asc' },
    });
    res.json(bills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create bill
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, provider, amount, dueDate, status, paymentMethod, notes } = req.body;
    if (!name || !category || !provider || amount === undefined || !dueDate) {
      res.status(400).json({ error: 'Missing required bill fields' });
      return;
    }

    const bill = await prisma.bill.create({
      data: {
        name,
        category,
        provider,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        status: status || 'PENDING',
        paymentMethod,
        notes,
        userId: req.userId!,
      },
    });
    res.status(201).json(bill);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update bill
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, category, provider, amount, dueDate, status, paymentMethod, notes } = req.body;

    const existingBill = await prisma.bill.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existingBill) {
      res.status(404).json({ error: 'Bill not found' });
      return;
    }

    const updatedBill = await prisma.bill.update({
      where: { id },
      data: {
        name,
        category,
        provider,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
        paymentMethod,
        notes,
      },
    });
    res.json(updatedBill);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete bill
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existingBill = await prisma.bill.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existingBill) {
      res.status(404).json({ error: 'Bill not found' });
      return;
    }

    await prisma.bill.delete({ where: { id } });
    res.json({ message: 'Bill deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
