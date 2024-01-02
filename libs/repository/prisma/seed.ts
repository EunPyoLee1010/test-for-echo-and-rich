import { PrismaClient } from '@prisma/client';

async function seed() {
    const prisma = new PrismaClient();
    prisma.$queryRaw`select 1`;
    console.log('Seed Code 추가');
}

seed();
