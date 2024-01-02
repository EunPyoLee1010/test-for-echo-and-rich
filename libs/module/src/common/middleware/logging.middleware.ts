import { Injectable, NestMiddleware } from '@nestjs/common';
import { SYSTEM_TOKEN } from '@module/constant/log.constant';
import { LogService } from '@module/module/log/log.service';
import { createLogMessage } from '@module/module/log/logging';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    constructor(private readonly logger: LogService) {}

    use(req: Request, res: Response, next: NextFunction) {
        const v4 = uuid();
        const reqStartTime = Date.now();

        this.logger.verbose(createLogMessage(v4, { req }), SYSTEM_TOKEN);
        next();

        res.on('finish', () => {
            const elapsedTime = Date.now() - reqStartTime;
            this.logger.verbose(createLogMessage(v4, { req, res, elapsedTime }), SYSTEM_TOKEN);
        });
    }
}
