import prisma from './utils/db';

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users:', users.map(u => ({ id: u.id, email: u.email })));

    if (users.length > 0) {
      const userId = users[0].id;
      console.log('Testing subscription creation for user:', userId);
      const sub = await prisma.subscription.create({
        data: {
          serviceName: 'Test Subscription',
          category: 'Software',
          cost: 299,
          billingCycle: 'Monthly',
          renewalDate: new Date(),
          paymentMethod: 'Card',
          userId,
        }
      });
      console.log('Subscription created successfully:', sub);
    } else {
      console.log('No users found in database.');
    }
  } catch (error: any) {
    console.error('Prisma query error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
