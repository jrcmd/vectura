#!/bin/bash
# scripts/seed-staging.sh — Injection de données de test en staging

cd backend

npx ts-node -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
    // Créer un admin
    await prisma.user.create({
        data: {
            email: 'admin@staging.vectura',
            password: 'hashed_password',
            role: 'ADMIN',
            firstName: 'Admin',
            lastName: 'Staging',
            status: 'ACTIF'
        }
    });

    // Créer des chauffeurs de test
    for (let i = 1; i <= 10; i++) {
        await prisma.driver.create({
            data: {
                email: 'chauffeur\${i}@staging.vectura',
                firstName: 'Chauffeur',
                lastName: 'Test\${i}',
                phone: '+3360000000\${i}',
                city: ['Paris', 'Lyon', 'Marseille', 'Bordeaux'][i % 4],
                status: 'VALIDE',
                licenseCategories: ['C', 'CE'],
                hasADR: i % 3 === 0,
                hasFrigo: i % 4 === 0
            }
        });
    }

    // Créer des entreprises de test
    for (let i = 1; i <= 5; i++) {
        await prisma.company.create({
            data: {
                email: 'entreprise\${i}@staging.vectura',
                name: 'Transport Test \${i}',
                siret: '1234567890001\${i}',
                city: ['Paris', 'Lyon', 'Marseille'][i % 3],
                status: 'ACTIF'
            }
        });
    }

    console.log('✅ Données de test injectées');
}

seed()
    .catch(console.error)
    .finally(() => prisma.\$disconnect());
"