import prisma from './utils/db';
import crypto from 'crypto';

const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

async function main() {
  const email = 'admin@lifeadmin.ai';
  const name = 'Admin User';
  const password = 'admin123';
  const hashedPassword = hashPassword(password);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('Admin user already exists in the database.');
    return;
  }

  console.log('Creating default admin user...');
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`Admin user created with ID: ${user.id}`);

  // Create sample bills
  console.log('Seeding sample bills...');
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 5);
  const overdueDate = new Date();
  overdueDate.setDate(now.getDate() - 3);

  await prisma.bill.createMany({
    data: [
      {
        name: 'Electricity Bill',
        category: 'Utilities',
        provider: 'BESCOM State Grid',
        amount: 2450,
        dueDate: nextWeek,
        status: 'PENDING',
        paymentMethod: 'Credit Card',
        notes: 'Monthly consumption charge',
        userId: user.id,
      },
      {
        name: 'Internet Broadband',
        category: 'Utilities',
        provider: 'Airtel Fibernet',
        amount: 1199,
        dueDate: nextWeek,
        status: 'PENDING',
        paymentMethod: 'Auto Debit',
        notes: 'Unlimited 200 Mbps plan',
        userId: user.id,
      },
      {
        name: 'Water Utility Bill',
        category: 'Utilities',
        provider: 'BWSSB water board',
        amount: 650,
        dueDate: overdueDate,
        status: 'PENDING',
        paymentMethod: 'Net Banking',
        notes: 'Overdue water tax supply',
        userId: user.id,
      },
      {
        name: 'Gas Cylinder Booking',
        category: 'Utilities',
        provider: 'Indane Gas',
        amount: 950,
        dueDate: now,
        status: 'PAID',
        paymentMethod: 'UPI',
        notes: 'Refill booked',
        userId: user.id,
      },
    ],
  });

  // Create sample insurance policies
  console.log('Seeding sample insurance policies...');
  const insStartDate = new Date();
  insStartDate.setFullYear(now.getFullYear() - 1);
  const insEndDate = new Date();
  insEndDate.setFullYear(now.getFullYear() + 1);
  const insRenewalDate = new Date();
  insRenewalDate.setDate(now.getDate() + 20);

  await prisma.insurance.createMany({
    data: [
      {
        policyName: 'HDFC Ergo Optima Restore',
        policyNumber: 'HDF-HP-99887766',
        provider: 'HDFC Ergo Health Insurance',
        insuranceType: 'Health',
        coverageAmount: 1000000,
        premiumAmount: 18500,
        startDate: insStartDate,
        endDate: insEndDate,
        renewalDate: insRenewalDate,
        nomineeDetails: 'Jane Doe (Spouse)',
        notes: 'Individual health restoration cover',
        userId: user.id,
      },
      {
        policyName: 'ICICI Lombard Car Shield',
        policyNumber: 'ICI-CAR-55443322',
        provider: 'ICICI Lombard General',
        insuranceType: 'Motor',
        coverageAmount: 650000,
        premiumAmount: 12400,
        startDate: insStartDate,
        endDate: insEndDate,
        renewalDate: insRenewalDate,
        nomineeDetails: 'Jane Doe (Spouse)',
        notes: 'Comprehensive bumper-to-bumper car insurance',
        userId: user.id,
      },
    ],
  });

  // Create sample subscriptions
  console.log('Seeding sample subscriptions...');
  const subRenewalDate = new Date();
  subRenewalDate.setDate(now.getDate() + 14);

  await prisma.subscription.createMany({
    data: [
      {
        serviceName: 'Netflix Premium',
        category: 'Entertainment',
        cost: 649,
        billingCycle: 'Monthly',
        renewalDate: subRenewalDate,
        paymentMethod: 'Credit Card',
        userId: user.id,
      },
      {
        serviceName: 'Spotify Duo',
        category: 'Music',
        cost: 149,
        billingCycle: 'Monthly',
        renewalDate: subRenewalDate,
        paymentMethod: 'UPI Auto-debit',
        userId: user.id,
      },
      {
        serviceName: 'Amazon Prime',
        category: 'Shopping & Delivery',
        cost: 1499,
        billingCycle: 'Yearly',
        renewalDate: subRenewalDate,
        paymentMethod: 'Credit Card',
        userId: user.id,
      },
    ],
  });

  // Create sample reminders
  console.log('Seeding sample reminders...');
  const reminderDate1 = new Date();
  reminderDate1.setDate(now.getDate() + 2);
  const reminderDate2 = new Date();
  reminderDate2.setDate(now.getDate() + 4);

  await prisma.reminder.createMany({
    data: [
      {
        title: 'Submit Car Insurance Papers to Bank',
        description: 'Need to submit copy of renewed policy schedule to home loan branch.',
        date: reminderDate1,
        type: 'Renewal',
        priority: 'HIGH',
        userId: user.id,
      },
      {
        title: 'Review Family Health Cover Nominees',
        description: 'Verify if spouse nominee details are updated correctly.',
        date: reminderDate2,
        type: 'Task',
        priority: 'MEDIUM',
        userId: user.id,
      },
    ],
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  });
