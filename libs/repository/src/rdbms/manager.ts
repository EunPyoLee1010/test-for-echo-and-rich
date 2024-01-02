import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { SYSTEM_TOKEN } from '@module/constant/log.constant';
import { LogService } from '@module/module/log/log.service';
import event from 'events';

@Injectable()
export class RDBMSConnectionManager extends event implements OnModuleInit {
    public readonly client: PrismaClient;
    private readonly reconnectEvent = 'reconnect';

    constructor(private readonly logger: LogService, private readonly config: ConfigService) {
        super();
        const prismaOption: Prisma.LogLevel[] =
            this.config.get('NODE_ENV') === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'];

        this.client = new PrismaClient({
            log: prismaOption,
            datasources: { db: { url: this.config.get('RDBMS_URL') } },
        });
        this.on(this.reconnectEvent, () => {
            setTimeout(async () => await this.onModuleInit(), 5000);
        });
    }

    async onModuleInit() {
        try {
            await this.client.$connect();
            this.logger.log('Database 연결이 완료됐습니다.', SYSTEM_TOKEN);
            return true;
        } catch (e) {
            console.log(e);
            this.logger.error('Database 연결에 실패하였습니다. 재연결을 시도합니다.', SYSTEM_TOKEN);
            this.emit(this.reconnectEvent);
            return false;
        }
    }
}
