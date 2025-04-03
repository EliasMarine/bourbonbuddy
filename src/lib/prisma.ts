import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Gracefully handle database connection issues
prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error) {
    // Log database errors
    console.error(`Prisma Error: ${params.model}.${params.action}`, error);
    throw error;
  }
});

// Ensure connections are closed properly
if (process.env.NODE_ENV !== 'development') {
  process.on('beforeExit', () => {
    // Ensure database connections are closed
    prisma.$disconnect();
  });
} 