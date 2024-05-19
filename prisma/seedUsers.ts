import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedUsers() {
  const users = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'conexa-admin',
      role: Role.ADMIN,
    },
    {
      name: 'Normal User 1',
      email: 'user1@example.com',
      password: 'conexa',
      role: Role.USER,
    },
    {
      name: 'Normal User 2',
      email: 'user2@example.com',
      password: 'conexa',
      role: Role.USER,
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: hashedPassword,
        role: user.role,
      },
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });
  }

  console.log('Users seeding completed.');
}

seedUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
