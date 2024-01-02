import { CallHandler, ExecutionContext, InternalServerErrorException, NestInterceptor } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { SYSTEM_TOKEN } from '@module/constant/log.constant';
import { isErrorType } from '@module/module/error';
import { LogService } from '@module/module/log/log.service';
import { createSocketLogMessage } from '@module/module/log/logging';
import { TSocketInfo } from '@module/type/token.type';
import { Observable, map } from 'rxjs';

export class SocketLoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: LogService) {}

    static create(logger: LogService) {
        return new SocketLoggingInterceptor(logger);
    }

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const { getClient, getData } = context.switchToWs();
        const client = getClient<TSocketInfo>();
        const data = getData();

        this.logger.verbose(createSocketLogMessage('REQ', { client, data }), SYSTEM_TOKEN);
        return next.handle().pipe(map((v) => this.transform(client, v)));
    }

    public transform(client: TSocketInfo, data: any) {
        let isCatched = false;
        try {
            return {
                result: !isErrorType(data),
                namespace: client.nsp.name,
                eventPath: client.handshake.headers.event,
                timestamp: new Date().toISOString(),
                response: data,
            };
        } catch (e) {
            console.log(e);
            isCatched = true;
            throw new WsException(new InternalServerErrorException());
        } finally {
            if (!isCatched)
                this.logger.verbose(createSocketLogMessage('RES', { client, data, endTime: Date.now() }), SYSTEM_TOKEN);
        }
    }
}
