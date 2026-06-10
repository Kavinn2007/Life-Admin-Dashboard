import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import prisma from '../utils/db';

const router = Router();

router.use(authenticateToken as any);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const policies = await prisma.insurance.findMany({
      where: { userId: req.userId },
    });
    res.json(policies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { policyName, policyNumber, provider, insuranceType, coverageAmount, premiumAmount, startDate, endDate, renewalDate, nomineeDetails, notes } = req.body;
    if (!policyName || !policyNumber || !provider || !insuranceType || coverageAmount === undefined || premiumAmount === undefined || !startDate || !endDate || !renewalDate) {
      res.status(400).json({ error: 'Missing required insurance fields' });
      return;
    }

    const policy = await prisma.insurance.create({
      data: {
        policyName,
        policyNumber,
        provider,
        insuranceType,
        coverageAmount: parseFloat(coverageAmount),
        premiumAmount: parseFloat(premiumAmount),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        renewalDate: new Date(renewalDate),
        nomineeDetails,
        notes,
        userId: req.userId!,
      },
    });
    res.status(201).json(policy);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { policyName, policyNumber, provider, insuranceType, coverageAmount, premiumAmount, startDate, endDate, renewalDate, nomineeDetails, notes } = req.body;

    const existingPolicy = await prisma.insurance.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existingPolicy) {
      res.status(404).json({ error: 'Policy not found' });
      return;
    }

    const updatedPolicy = await prisma.insurance.update({
      where: { id },
      data: {
        policyName,
        policyNumber,
        provider,
        insuranceType,
        coverageAmount: coverageAmount !== undefined ? parseFloat(coverageAmount) : undefined,
        premiumAmount: premiumAmount !== undefined ? parseFloat(premiumAmount) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        renewalDate: renewalDate ? new Date(renewalDate) : undefined,
        nomineeDetails,
        notes,
      },
    });
    res.json(updatedPolicy);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existingPolicy = await prisma.insurance.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existingPolicy) {
      res.status(404).json({ error: 'Policy not found' });
      return;
    }

    await prisma.insurance.delete({ where: { id } });
    res.json({ message: 'Policy deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
