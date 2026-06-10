import '../src/loadEnv.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.income.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 12);

  const owner = await prisma.user.create({
    data: {
      email: 'owner@demo.com',
      passwordHash,
      name: 'Project Owner',
    },
  });

  const member = await prisma.user.create({
    data: {
      email: 'member@demo.com',
      passwordHash,
      name: 'Project Member',
    },
  });

  const project = await prisma.project.create({
    data: {
      name: 'Downtown Office',
      location: 'Oslo, Norway',
      ownerId: owner.id,
    },
  });

  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: member.id,
    },
  });

  await prisma.expense.createMany({
    data: [
      { projectId: project.id, name: 'Concrete', amount: 1200, createdById: owner.id },
      { projectId: project.id, name: ' concrete ', amount: 300, createdById: member.id },
      { projectId: project.id, name: 'Steel', amount: 800, createdById: owner.id },
    ],
  });

  await prisma.income.createMany({
    data: [
      { projectId: project.id, name: 'Client Milestone', amount: 2500, createdById: owner.id },
      { projectId: project.id, name: 'Permits Refund', amount: 150, createdById: member.id },
    ],
  });

  console.log('Demo data seeded successfully.');
  console.log('');
  console.log('Users:');
  console.log('  owner@demo.com / password123');
  console.log('  member@demo.com / password123');
  console.log('');
  console.log(`Project ID: ${project.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
