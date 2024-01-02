import { Request, Response } from 'express';
import { getIpAddress } from '../etc';
import { v4 } from 'uuid';
import { TSocketInfo } from '@module/type/token.type';

export function createLogMessage(
    v4: string,
    { req, res, elapsedTime }: { req: Request; res?: Response; elapsedTime?: number }
) {
    const { method, query, body, protocol, httpVersion, headers, originalUrl } = req;
    const userAgent = headers['user-agent'];
    const requestData = JSON.stringify({ ...query, ...body });
    const ipAddr = getIpAddress(req);

    const messageFormat = [
        `[${res === undefined ? 'REQ' : 'RES'}] ${v4} ${ipAddr}`,
        `${method} ${originalUrl} ${protocol.toUpperCase()}/${httpVersion} ${
            res === undefined ? requestData : `${res.statusCode} ${elapsedTime}ms`
        }`,
        userAgent,
    ];

    return messageFormat.join(' | ');
}

export function createSocketLogMessage(
    logType: 'REQ' | 'RES',
    { client, data, endTime }: { client: TSocketInfo; data: any; endTime?: number }
) {
    if (logType === 'REQ') {
        const uuid = v4();
        const startTime = Date.now();
        client.requestInfo = { uuid, startTime };
    }
    const { headers, address } = client.handshake;
    const { uuid, startTime } = client.requestInfo;
    const { event, 'user-agent': userAgent } = headers ?? {};
    const httpVersion = client.request.httpVersion;
    const ip = address.replace('::ffff:', '');
    const namespace = client.nsp?.name ?? 'none';
    const messageFormat = [
        `[${logType}] ${uuid} ${ip}`,
        `${client.id} ${namespace} ${event} Socket/${httpVersion} ${
            logType === 'REQ' ? JSON.stringify(data) : `${endTime - startTime}ms`
        }`,
        userAgent,
    ];
    return messageFormat.join(' | ');
}
