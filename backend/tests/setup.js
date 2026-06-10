import { execSync } from 'node:child_process';
import { prisma } from '../src/lib/prisma.js';

beforeAll(async () => {
  if (process.env.TEST_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  }

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
    },
  });
});

beforeEach(async () => {
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
  const tables = [
    'incomes',
    'expenses',
    'invitations',
    'project_members',
    'projects',
    'users',
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\``);
  }
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
});

afterAll(async () => {
  await prisma.$disconnect();
});
