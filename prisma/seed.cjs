// prisma/seed.cjs
const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const tempPassword = process.env.SEED_TEMP_PASSWORD || 'CambioSubito!123';
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  // Upsert users
  await prisma.user.upsert({
    where: { email: 'amministratore@rematarlazzi.it' },
    update: {},
    create: {
      name: 'Amministratore',
      email: 'amministratore@rematarlazzi.it',
      role: 'ADMIN',
      passwordHash,
      mustChangePassword: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'peter.dipasquantonio@rematarlazzi.it' },
    update: {},
    create: {
      name: 'Peter',
      email: 'peter.dipasquantonio@rematarlazzi.it',
      role: 'USER',
      passwordHash,
      mustChangePassword: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'matteo@rematarlazzi.it' },
    update: {},
    create: {
      name: 'Matteo',
      email: 'matteo@rematarlazzi.it',
      role: 'USER',
      passwordHash,
      mustChangePassword: true,
    },
  });

  console.log('Seed completato. Utenti creati/aggiornati con password temporanea.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
