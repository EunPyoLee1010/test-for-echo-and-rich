import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { getIpAddress } from '@module/module/etc';
import { TRequestInfo } from '@module/type/request.type';
import { Request } from 'express';

export const RequestInfo = createParamDecorator((_: unknown, ctx: ExecutionContext): TRequestInfo => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return { ipAddress: getIpAddress(req), userAgent: req.headers['user-agent'] };
});
