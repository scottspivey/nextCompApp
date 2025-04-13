// lib/prisma.ts (or src/lib/prisma.ts)

// Import PrismaClient from your custom output location
import { PrismaClient } from '@/prisma/app/generated/prisma/client'; // Adjust the relative path if needed

// Initialize Prisma Client once (singleton pattern)
// This prevents creating too many connections in development/serverless environments
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Optional: uncomment to log queries
    // log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export the single instance
export default prisma;
