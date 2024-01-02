import {
    CallHandler,
    ExecutionContext,
    Injectable,
    InternalServerErrorException,
    NestInterceptor,
} from '@nestjs/common';
import { ERROR_SYSTEM_LOGIC } from '@module/constant/error.constant';
import { TSocketInfo } from '@module/type/token.type';
import { Request } from 'express';
import { Observable } from 'rxjs';

export const REQUEST_TOKEN_CONTEXT = '_TOKEN';

@Injectable()
export class InjectUserInterceptor implements NestInterceptor {
    constructor(private type?: 'query' | 'body' | 'params') {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        try {
            const req = context.switchToHttp().getRequest<Request>();
            const client = context.switchToWs().getClient<TSocketInfo>();
            const data = context.switchToWs().getData();

            if (req) this.injectUserToHttp(req);
            if (client) this.injectUserToSocket(client, data);

            return next.handle();
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(ERROR_SYSTEM_LOGIC);
        }
    }

    public injectUserToHttp(req: Request) {
        if (this.type && req[this.type]) {
            req[this.type][REQUEST_TOKEN_CONTEXT] = req.token;
        }
    }
    public injectUserToSocket(client: TSocketInfo, data: any) {
        if (typeof data === 'object') {
            data[REQUEST_TOKEN_CONTEXT] = client.token;
        }
    }
}
