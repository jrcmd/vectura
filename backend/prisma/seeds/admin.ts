import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`INSERT INTO "User" (id, email, password, role, status, first_name, last_name, phone, city, created_at, updated_at) VALUES ('admin-1', 'admin@vectura.test', 'admin', 'ADMIN', 'VALIDE', 'Admin', 'Root', '0600000000', 'Paris', NOW(), NOW()) ON CONFLICT DO NOTHING`;
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
