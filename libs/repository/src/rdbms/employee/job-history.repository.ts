/* eslint-disable camelcase */
import { Prisma } from '@prisma/client';
import { RDBMSConnectionManager } from '../manager';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JobHistoryRepository {
    private readonly historyRepo: Prisma.job_historyDelegate;
    constructor(private readonly rdbms: RDBMSConnectionManager) {
        this.historyRepo = this.rdbms.client.job_history;
    }

    async get(args?: Prisma.job_historyFindManyArgs) {
        return await this.historyRepo.findMany({
            ...args,
            include: {
                employees: { select: { email: true, first_name: true, last_name: true, phone_number: true } },
                departments: { select: { department_name: true } },
                jobs: { select: { job_title: true } },
            },
        });
    }

    async create(args: Prisma.job_historyCreateManyArgs) {
        const { data } = args;
        const result = await this.historyRepo.createMany(args).then((v) => v.count);
        const count = Array.isArray(data) ? data.length : 1;
        return result === count;
    }

    async update(args: Prisma.job_historyUpdateManyArgs) {
        const { data } = args;
        const result = await this.historyRepo.updateMany(args).then((v) => v.count);
        const count = Array.isArray(data) ? data.length : 1;
        return result === count;
    }
}
