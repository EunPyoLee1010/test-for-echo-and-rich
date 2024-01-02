import { PrismaClient } from '@prisma/client';

async function bootstrap() {
    const prisma = new PrismaClient();
    console.log('Seed Code 추가');
}

bootstrap();
