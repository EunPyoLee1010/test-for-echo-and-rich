import { randomBytes, randomInt } from 'crypto';

export function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    return Array.from({ length }, () => 0)
        .map(() => characters.charAt(randomInt(0, characters.length)))
        .join('');
}

export function createRandomCode() {
    const min = 100000;
    const max = 999999;
    const randomBuffer = randomBytes(4);
    const randomNumber = randomBuffer.readUInt32BE(0);
    return (min + (randomNumber % (max - min + 1))).toString();
}
