import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import prisma from '../utils/db';

const router = Router();

router.use(authenticateToken as any);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'asc' },
    });
    res.json(reminders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, date, type, priority, recurrence } = req.body;
    if (!title || !date || !type) {
      res.status(400).json({ error: 'Missing required reminder fields' });
      return;
    }

    const reminder = await prisma.reminder.create({
      data: {
        title,
        description,
        date: new Date(date),
        type,
        priority: priority || 'MEDIUM',
        recurrence: recurrence || 'NONE',
        userId: req.userId!,
      },
    });
    res.status(201).json(reminder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, description, date, type, priority, recurrence } = req.body;

    const existingReminder = await prisma.reminder.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existingReminder) {
      res.status(404).json({ error: 'Reminder not found' });
      return;
    }

    const updatedReminder = await prisma.reminder.update({
      where: { id },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        type,
        priority,
        recurrence,
      },
    });
    res.json(updatedReminder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existingReminder = await prisma.reminder.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existingReminder) {
      res.status(404).json({ error: 'Reminder not found' });
      return;
    }

    await prisma.reminder.delete({ where: { id } });
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
