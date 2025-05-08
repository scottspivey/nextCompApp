// prisma/test-prisma.ts
import { PrismaClient } from '@prisma/client';

async function test() {
  const prisma = new PrismaClient();
  try {
    console.log('Attempting to access prisma.user...');
    console.log(typeof prisma.user); // Should log 'object' or 'function' if defined

    console.log('Attempting to access prisma.employer...');
    console.log(typeof prisma.employer); // Should log 'object' or 'function' if defined

    console.log('Attempting to access prisma.medicalProvider...');
    console.log(typeof prisma.medicalProvider); // Should log 'object' or 'function'

    // You can add a simple query if the above logs suggest the properties exist
    // await prisma.$connect();
    // console.log('Connected to database via test script!');
    // const userCount = await prisma.user.count();
    // console.log(`User count: ${userCount}`);
    // const employerCount = await prisma.employer.count();
    // console.log(`Employer count: ${employerCount}`);

  } catch (e: any) {
    console.error('Error in test-prisma.ts:', e.message);
    if (e.code) {
      console.error(`Error code: ${e.code}`);
    }
  } finally {
    await prisma.$disconnect().catch(e => console.error('Error disconnecting:', e.message));
  }
}

test();