import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import prisma from '../utils/db';

const router = Router();

router.use(authenticateToken as any);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subs = await prisma.subscription.findMany({
      where: { userId: req.userId },
    });
    res.json(subs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serviceName, category, provider, cost, billingCycle, startDate, renewalDate, paymentMethod, notes } = req.body;
    if (!serviceName || !category || cost === undefined || !billingCycle || !renewalDate) {
      res.status(400).json({ error: 'Missing required subscription fields' });
      return;
    }

    const sub = await prisma.subscription.create({
      data: {
        serviceName,
        category,
        provider,
        cost: parseFloat(cost),
        billingCycle,
        startDate: startDate ? new Date(startDate) : null,
        renewalDate: new Date(renewalDate),
        paymentMethod,
        notes,
        userId: req.userId!,
      },
    });
    res.status(201).json(sub);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { serviceName, category, provider, cost, billingCycle, startDate, renewalDate, paymentMethod, notes } = req.body;

    const existingSub = await prisma.subscription.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existingSub) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    const updatedSub = await prisma.subscription.update({
      where: { id },
      data: {
        serviceName,
        category,
        provider,
        cost: cost !== undefined ? parseFloat(cost) : undefined,
        billingCycle,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
        renewalDate: renewalDate ? new Date(renewalDate) : undefined,
        paymentMethod,
        notes,
      },
    });
    res.json(updatedSub);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete subscription
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existingSub = await prisma.subscription.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existingSub) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    await prisma.subscription.delete({ where: { id } });
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
