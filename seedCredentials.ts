import prisma from './src/db';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('Sembrando credenciales...');

  // 1. New Bytes (Desde .env)
  if (process.env.NEWBYTES_TOKEN) {
    await prisma.distributorConfig.upsert({
      where: { distributor: 'newbytes' },
      update: {},
      create: {
        distributor: 'newbytes',
        name: 'New Bytes',
        credentials: JSON.stringify({
          token: process.env.NEWBYTES_TOKEN // Ojo: Tu .env usa token, no user/pass para NB.
        })
      }
    });
    console.log('✅ New Bytes migrado (Token).');
  }

  // 2. Grupo Nucleo (Desde .env)
  if (process.env.NUCLEO_USERNAME && process.env.NUCLEO_PASSWORD) {
    await prisma.distributorConfig.upsert({
      where: { distributor: 'gruponucleo' },
      update: {},
      create: {
        distributor: 'gruponucleo',
        name: 'Grupo Nucleo',
        credentials: JSON.stringify({
          id: process.env.NUCLEO_ID,
          user: process.env.NUCLEO_USERNAME,
          password: process.env.NUCLEO_PASSWORD
        })
      }
    });
    console.log('✅ Grupo Nucleo migrado.');
  }

  // 3. Elit (Datos que me pasaste recién)
  // Como no estaban en .env, los ponemos aquí directo para la primera carga
  await prisma.distributorConfig.upsert({
    where: { distributor: 'elit' },
    update: {},
    create: {
      distributor: 'elit',
      name: 'Elit',
      credentials: JSON.stringify({
        user_id: "28736",
        token: "plv92s1l2j"
      })
    }
  });
  console.log('✅ Elit migrado (Datos manuales).');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());