import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import prisma from '../utils/db';

const router = Router();

router.use(authenticateToken as any);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);
    const next30Days = new Date();
    next30Days.setDate(now.getDate() + 30);

    // 1. Fetch user data
    const bills = await prisma.bill.findMany({ where: { userId } });
    const subscriptions = await prisma.subscription.findMany({ where: { userId } });
    const insurances = await prisma.insurance.findMany({ where: { userId } });
    const reminders = await prisma.reminder.findMany({ where: { userId } });
    const documents = await prisma.document.findMany({ where: { userId } });

    // 2. Calculations
    // Monthly Bills sum
    const monthlyBillsCost = bills
      .filter((b: any) => b.status !== 'PAID')
      .reduce((sum: number, b: any) => sum + b.amount, 0);

    // Subscriptions cost (normalize to monthly)
    const monthlySubsCost = subscriptions.reduce((sum: number, s: any) => {
      const cost = s.cost;
      const cycle = s.billingCycle.toLowerCase();
      if (cycle.includes('year')) {
        return sum + (cost / 12);
      } else if (cycle.includes('week')) {
        return sum + (cost * 52 / 12);
      }
      return sum + cost;
    }, 0);

    // Insurance premium cost (normalize to monthly)
    const monthlyInsuranceCost = insurances.reduce((sum: number, i: any) => sum + (i.premiumAmount / 12), 0);

    // Total monthly spending projection
    const totalMonthlyProjection = monthlyBillsCost + monthlySubsCost + monthlyInsuranceCost;

    // Upcoming counts
    const upcomingBills = bills.filter((b: any) => {
      const d = new Date(b.dueDate);
      return b.status !== 'PAID' && d >= now && d <= next7Days;
    });

    const upcomingInsurances = insurances.filter((i: any) => {
      const d = new Date(i.renewalDate);
      return d >= now && d <= next30Days;
    });

    const upcomingReminders = reminders.filter((r: any) => {
      const d = new Date(r.date);
      return d >= now && d <= next7Days;
    });

    // 3. Assemble Upcoming Due Dates list
    const dueDatesList: any[] = [];

    // Add Bills
    bills.forEach((b: any) => {
      if (b.status !== 'PAID') {
        const diffTime = new Date(b.dueDate).getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= -7 && diffDays <= 30) {
          dueDatesList.push({
            id: b.id,
            name: b.name,
            amount: `₹ ${b.amount.toLocaleString()}`,
            date: new Date(b.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: diffDays < 0 ? 'Overdue' : `${diffDays} days left`,
            type: 'bill',
            color: diffDays < 0 ? 'text-red-600' : diffDays <= 3 ? 'text-red-500' : 'text-slate-500',
            daysLeft: diffDays,
          });
        }
      }
    });

    // Add Insurance
    insurances.forEach((i: any) => {
      const diffTime = new Date(i.renewalDate).getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= -7 && diffDays <= 30) {
        dueDatesList.push({
          id: i.id,
          name: i.policyName,
          amount: `₹ ${i.premiumAmount.toLocaleString()}`,
          date: new Date(i.renewalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: diffDays < 0 ? 'Overdue' : `${diffDays} days left`,
          type: 'insurance',
          color: diffDays < 0 ? 'text-red-600' : diffDays <= 10 ? 'text-orange-500' : 'text-slate-500',
          daysLeft: diffDays,
        });
      }
    });

    // Add Subscriptions
    subscriptions.forEach((s: any) => {
      const diffTime = new Date(s.renewalDate).getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= -7 && diffDays <= 30) {
        dueDatesList.push({
          id: s.id,
          name: s.serviceName,
          amount: `₹ ${s.cost.toLocaleString()}`,
          date: new Date(s.renewalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: diffDays < 0 ? 'Overdue' : `${diffDays} days left`,
          type: 'subscription',
          color: 'text-blue-500',
          daysLeft: diffDays,
        });
      }
    });

    // Sort by due proximity
    dueDatesList.sort((a, b) => a.daysLeft - b.daysLeft);

    // 4. Generate dynamic notifications alerts
    const alerts: any[] = [];
    dueDatesList.forEach((item: any) => {
      if (item.daysLeft <= 14) {
        alerts.push({
          title: item.daysLeft < 0 ? `${item.name} is OVERDUE` : `${item.name} is due in ${item.daysLeft} days`,
          type: item.daysLeft < 0 ? 'urgent' : item.daysLeft <= 3 ? 'warning' : 'info',
          time: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 09:00 AM',
        });
      }
    });

    // Add document expiry notification
    documents.forEach((doc: any) => {
      if (doc.expiryDate) {
        const diffTime = new Date(doc.expiryDate).getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 30) {
          alerts.push({
            title: `Document ${doc.name} expires in ${diffDays} days`,
            type: 'warning',
            time: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 09:00 AM',
          });
        }
      }
    });

    // Default notifications if none exist
    if (alerts.length === 0) {
      alerts.push({
        title: 'All accounts up to date. No upcoming alerts.',
        type: 'success',
        time: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 07:45 PM',
      });
    }

    // 5. Pie chart category percentages
    const totalExpensesSum = monthlyBillsCost + monthlySubsCost + monthlyInsuranceCost;
    const chartData = [
      { name: 'Bills', value: totalExpensesSum > 0 ? Math.round((monthlyBillsCost / totalExpensesSum) * 100) : 0, color: '#2563EB' },
      { name: 'Subscriptions', value: totalExpensesSum > 0 ? Math.round((monthlySubsCost / totalExpensesSum) * 100) : 0, color: '#10B981' },
      { name: 'Insurance', value: totalExpensesSum > 0 ? Math.round((monthlyInsuranceCost / totalExpensesSum) * 100) : 0, color: '#F59E0B' },
      { name: 'Others', value: 0, color: '#6366F1' },
    ];

    res.json({
      summary: {
        totalMonthlySpent: totalExpensesSum,
        upcomingBillsCount: upcomingBills.length,
        upcomingBillsSum: upcomingBills.reduce((sum: number, b: any) => sum + b.amount, 0),
        upcomingInsuranceCount: upcomingInsurances.length,
        activeSubscriptionsCount: subscriptions.length,
        upcomingRemindersCount: upcomingReminders.length,
      },
      chartData,
      dueDates: dueDatesList,
      alerts: alerts.slice(0, 5),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
