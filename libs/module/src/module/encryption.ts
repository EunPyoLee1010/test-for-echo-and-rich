import { TRequestInfo } from '@module/type/request.type';
import crypto from 'crypto';
import { Request } from 'express';
import { getIpAddress } from './etc';

export function encryptJwtSecretKey(
    { req, ipAddress, userAgent }: Partial<TRequestInfo> & { req?: Request },
    jwtSecret: string
) {
    const agent = userAgent ?? req?.headers?.['user-agent'];
    const ipAddr = getIpAddress(ipAddress) ?? getIpAddress(req);
    const encrypJwtString = `${agent}+${ipAddr}+${jwtSecret}`;
    return Buffer.from(encrypJwtString).toString('base64');
}

export function createSalt() {
    return crypto.randomBytes(64).toString('base64');
}

export function createHash(password: string, salt: string) {
    return crypto.pbkdf2Sync(password, salt, 101096, 64, 'sha512').toString('base64');
}
