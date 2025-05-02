// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Define the type for the globalThis object to include an optional prisma property
// Use 'var' to allow redeclaration across modules in development
declare global {
  // eslint-disable-next-line no-var -- Using var is necessary for global augmentation here.
  var prisma: PrismaClient | undefined;
}

// Initialize Prisma Client, reusing the existing instance in development
// or creating a new one in production or if it doesn't exist
const prisma = globalThis.prisma ?? new PrismaClient();

// In development, assign the new instance to the global variable
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;