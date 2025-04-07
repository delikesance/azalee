import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

async function connectWithRetry(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('Connected to database');
      return;
    } catch (err) {
      console.error(`Database connection error (attempt ${i + 1}):`, err);
      if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
    }
  }
  console.error('Failed to connect to the database after multiple attempts.');
  process.exit(1);
}

connectWithRetry();

