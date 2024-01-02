import { Injectable, LoggerService } from '@nestjs/common';
import { Logger, createLogger, format, transports } from 'winston';
import util from 'util';
import moment from 'moment';
import { TTokenPayload } from '@module/type/token.type';
import { TLogSaveInfo } from '@module/type/log.type';

@Injectable()
export class LogService implements LoggerService {
    private readonly logger: Logger;
    private readonly service: string = globalThis.serviceName;
    constructor() {
        const serviceFormat = util.format(`\x1b[35m%s\x1b[0m`, globalThis.serviceName ?? this.service);
        this.logger = createLogger({
            transports: [
                new transports.Console({
                    level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
                    format: format.combine(
                        format.timestamp(),
                        format.colorize(),
                        format.printf((obj) => {
                            const timeFormat = util.format(`\x1b[36m%s\x1b[0m`, moment().format('YYYY-MM-DD HH:mm:ss'));
                            return `[${serviceFormat}] ${timeFormat} ${obj.level}: ${obj.message}`;
                        })
                    ),
                }),
            ],
        });
    }

    async log(message: string, token: Partial<TTokenPayload>) {
        this.logger.info(message);
        this.saveLog({ userId: token.userId, message, level: 'info' });
    }

    async debug(message: string, token: Partial<TTokenPayload>) {
        this.logger.debug(message);
        this.saveLog({ userId: token.userId, message, level: 'debug' });
    }

    async verbose(message: string, token: Partial<TTokenPayload>) {
        this.logger.verbose(message);
        this.saveLog({ userId: token.userId, message, level: 'verbose' });
    }

    async warn(message: string, token: Partial<TTokenPayload>) {
        this.logger.warn(message);
        this.saveLog({ userId: token.userId, message, level: 'warn' });
    }

    async error(message: string, token: Partial<TTokenPayload>) {
        this.logger.error(message);
        this.saveLog({ userId: token.userId, message, level: 'error' });
    }

    async saveLog({ userId, message, level }: TLogSaveInfo) {
        //로그 저장 로직
    }
}
