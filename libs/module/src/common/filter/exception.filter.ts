import { ArgumentsHost, Catch, ExceptionFilter, HttpException, NotFoundException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { SYSTEM_TOKEN } from '@module/constant/log.constant';
import { LogService } from '@module/module/log/log.service';
import { createLogMessage, createSocketLogMessage } from '@module/module/log/logging';
import { TTransformResponse } from '@module/type/response.type';
import { TSocketInfo } from '@module/type/token.type';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: LogService) {}
    catch(exception: HttpException, host: ArgumentsHost): Response<TTransformResponse<string | object>> {
        const { getRequest, getResponse } = host.switchToHttp();
        const req = getRequest<Request>();
        const res = getResponse<Response>();
        const status = exception.getStatus();
        const data = exception.getResponse();

        if (exception instanceof NotFoundException) {
            const { uuid, reqStartTime } = req.requestInfo;
            const elapsedTime = Date.now() - reqStartTime;
            res.statusCode = status;
            this.logger.verbose(createLogMessage(uuid, { req, res, elapsedTime }), SYSTEM_TOKEN);
        }

        const responseJson: TTransformResponse<string | object> = {
            statusCode: status,
            path: req.path,
            timestamp: new Date().toISOString(),
            response: data ?? '',
        };
        return res.status(status).json(responseJson);
    }
}

@Catch()
export class SocketExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: LogService) {}
    catch(exception: WsException | HttpException | Error, host: ArgumentsHost) {
        const error = (() => {
            if (exception instanceof HttpException) return exception.getResponse();
            else if (exception instanceof Error) return exception as Error;
            else return (exception as WsException).getError();
        })();

        const { getClient, getData } = host.switchToWs();
        const client = getClient<TSocketInfo>();
        const data = getData();
        const event = client.handshake.headers.event;

        this.logger.error(createSocketLogMessage('RES', { client, data, endTime: Date.now() }), SYSTEM_TOKEN);
        const response = {
            result: false,
            namespace: client.nsp.name,
            eventPath: event,
            timestamp: new Date().toISOString(),
            response: error,
        };

        const callback = host.getArgByIndex(2);
        if (callback && typeof callback === 'function') {
            return callback(response);
        }
        return response;
    }
}
