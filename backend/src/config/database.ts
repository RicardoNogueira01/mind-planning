// Prisma Database Client
// Singleton pattern for database connection

import { PrismaClient } from '@prisma/client';
import { config } from './env';

// Prevent multiple instances during development hot-reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: config.isDev ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
});

if (config.isDev) {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
