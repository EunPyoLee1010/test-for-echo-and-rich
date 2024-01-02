/* eslint-disable camelcase */
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { RDBMSConnectionManager } from '../manager';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { existsSync, writeFile } from 'fs';
import { ERROR_FILE_PATH_NOT_FOUND } from '@module/constant/error.constant';

@Injectable()
export class LogRepository {
    private readonly logRepo: Prisma.LogDelegate;

    constructor(
        @Inject(forwardRef(() => RDBMSConnectionManager)) private readonly rdbms: RDBMSConnectionManager,
        private readonly config: ConfigService
    ) {
        this.logRepo = this.rdbms.client.log;
    }

    async get(args?: Prisma.LogWhereInput) {
        return this.logRepo.findMany({ where: args });
    }

    async create(data: Prisma.LogCreateManyInput | Prisma.LogCreateManyInput[]) {
        const result = await this.logRepo.createMany({ data, skipDuplicates: true }).then((v) => v.count);
        const count = Array.isArray(data) ? data.length : 1;
        return result === count;
    }

    async archive() {
        const archiveFilePath = this.config.get('ARCHIVE_FILE_PATH');
        if (!existsSync(archiveFilePath)) return ERROR_FILE_PATH_NOT_FOUND;
        //많은 로그 데이터에 대한 예외처리 필요
        const logList = await this.get();
        writeFile(archiveFilePath, logList.join('\n'), async (err) => {
            if (err) console.log('Failed To Archive');
            else {
                const logIdList = logList.map((v) => v.logId);
                await this.logRepo.deleteMany({ where: { logId: { in: logIdList } } });
            }
        });
        return true;
    }
}
