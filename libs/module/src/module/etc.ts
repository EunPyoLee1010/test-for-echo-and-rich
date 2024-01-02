import { Request } from 'express';

export function getIpAddress(req: Request | string) {
    if (!req) return undefined;
    const orgIp = (() => {
        if (typeof req === 'string') return req;
        const { headers, socket } = req ?? {};
        return (headers['x-forwarded-for'] || socket.remoteAddress) as string;
    })();

    if (orgIp.includes('::ffff:')) {
        return orgIp.split(':')?.reverse()?.[0];
    }
    return orgIp;
}
