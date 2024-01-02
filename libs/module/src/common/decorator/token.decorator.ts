import {
    ExecutionContext,
    InternalServerErrorException,
    UseInterceptors,
    UsePipes,
    applyDecorators,
    createParamDecorator,
} from '@nestjs/common';
import { ERROR_SYSTEM_LOGIC } from '@module/constant/error.constant';
import { TSocketInfo, TTokenPayload } from '@module/type/token.type';
import { Request } from 'express';
import { StripRequestContextPipe } from '@module/common/pipe/request.pipe';
import { InjectUserInterceptor } from '../interceptor/inject-user.interceptor';

export const Token = createParamDecorator((_: unknown, ctx: ExecutionContext): TTokenPayload => {
    try {
        const req = ctx.switchToHttp().getRequest<Request>();
        return req.token;
    } catch (e) {
        console.log(e);
        throw new InternalServerErrorException(ERROR_SYSTEM_LOGIC);
    }
});

export const SocketToken = createParamDecorator((_: unknown, ctx: ExecutionContext): TTokenPayload => {
    const client = ctx.switchToWs().getClient<TSocketInfo>();
    return client.token;
});

export function SocketInjectToken() {
    return applyDecorators(UseInterceptors(new InjectUserInterceptor()), UsePipes(StripRequestContextPipe));
}
