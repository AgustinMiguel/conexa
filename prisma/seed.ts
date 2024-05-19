import { PrismaClient } from '@prisma/client';
import { seedFilms } from './seedFilms';
import { seedUsers } from './seedUsers';

const prisma = new PrismaClient();

async function main() {
  await seedUsers();
  await seedFilms();

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
