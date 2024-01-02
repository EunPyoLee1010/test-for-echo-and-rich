import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { TOauthTokenPayload } from '@module/type/oauth.type';
import { Request } from 'express';

export const OauthToken = createParamDecorator((_: unknown, ctx: ExecutionContext): TOauthTokenPayload => {
    try {
        const req = ctx.switchToHttp().getRequest<Request>();
        return req.oauthToken;
    } catch (e) {
        console.log(e);
        return undefined;
    }
});
