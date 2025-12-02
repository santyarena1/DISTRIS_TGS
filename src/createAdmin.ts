// src/createAdmin.ts
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import prisma from './db';

dotenv.config();

async function main() {
  const email = 'admin@tgs.com';
  const plainPassword = 'admin123'; // luego la cambiás

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
    },
    create: {
      email,
      password: passwordHash,
      name: 'Admin',
      role: 'admin',
    },
  });

  console.log('Usuario admin creado/actualizado:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
