import { Role, UserStatus } from '@prisma/client';

import prisma from '../src/lib/prisma';
import { hashPassword } from '../src/lib/password';

const ADMIN_ID = 'admin-1';
const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL ?? 'admin@vectura.test';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD ?? 'admin123';
const ADMIN_FIRST = process.env.ADMIN_SEED_FIRST ?? 'Admin';
const ADMIN_LAST = process.env.ADMIN_SEED_LAST ?? 'Root';
const ADMIN_PHONE = process.env.ADMIN_SEED_PHONE ?? '0600000000';
const ADMIN_CITY = process.env.ADMIN_SEED_CITY ?? 'Paris';

async function main() {
  const passwordHash = hashPassword(ADMIN_PASSWORD);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password: passwordHash,
      role: Role.ADMIN,
      status: UserStatus.VALIDE,
      firstName: ADMIN_FIRST,
      lastName: ADMIN_LAST,
      phone: ADMIN_PHONE,
      city: ADMIN_CITY,
    },
    create: {
      id: ADMIN_ID,
      email: ADMIN_EMAIL,
      password: passwordHash,
      role: Role.ADMIN,
      status: UserStatus.VALIDE,
      firstName: ADMIN_FIRST,
      lastName: ADMIN_LAST,
      phone: ADMIN_PHONE,
      city: ADMIN_CITY,
    },
  });

  console.log(`[seed] Admin ready: ${ADMIN_EMAIL} (id: ${ADMIN_ID})`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('[seed] Fatal:', err);
  process.exit(1);
});
