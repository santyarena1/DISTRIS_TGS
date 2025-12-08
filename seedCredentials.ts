import prisma from './src/db';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('Sembrando credenciales desde .env...');

  // 1. New Bytes
  if (process.env.NB_USER && process.env.NB_PASSWORD) {
    await prisma.distributorConfig.upsert({
      where: { distributor: 'newbytes' },
      update: {},
      create: {
        distributor: 'newbytes',
        name: 'New Bytes',
        credentials: JSON.stringify({
          user: process.env.NB_USER,
          password: process.env.NB_PASSWORD
        })
      }
    });
    console.log('✅ New Bytes migrado.');
  }

  // 2. Grupo Nucleo
  if (process.env.GN_USER && process.env.GN_PASSWORD) {
    await prisma.distributorConfig.upsert({
      where: { distributor: 'gruponucleo' },
      update: {},
      create: {
        distributor: 'gruponucleo',
        name: 'Grupo Nucleo',
        credentials: JSON.stringify({
          user: process.env.GN_USER,
          password: process.env.GN_PASSWORD
        })
      }
    });
    console.log('✅ Grupo Nucleo migrado.');
  }

  // 3. Elit
  if (process.env.ELIT_API_KEY) {
    await prisma.distributorConfig.upsert({
      where: { distributor: 'elit' },
      update: {},
      create: {
        distributor: 'elit',
        name: 'Elit',
        credentials: JSON.stringify({
          apiKey: process.env.ELIT_API_KEY
        })
      }
    });
    console.log('✅ Elit migrado.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());