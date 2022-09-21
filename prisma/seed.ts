/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const signersData = [
  {
    id: 1,
    name: 'Giovanny Gonzalez Baltazar',
  },
  {
    id: 2,
    name: 'John Doe',
  },
  {
    id: 3,
    name: 'Mickey Testerton',
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const s of signersData) {
    const signer = await prisma.signer.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
    console.log(`Created/updated signer with id: ${signer.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
