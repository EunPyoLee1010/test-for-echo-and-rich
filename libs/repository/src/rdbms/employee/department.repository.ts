/* eslint-disable camelcase */
import { Prisma } from '@prisma/client';
import { RDBMSConnectionManager } from '../manager';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DepartmentRepository {
    private readonly departmentRepo: Prisma.departmentsDelegate;
    constructor(private readonly rdbms: RDBMSConnectionManager) {
        this.departmentRepo = this.rdbms.client.departments;
    }

    async get(args?: Prisma.departmentsFindManyArgs) {
        return await this.departmentRepo.findMany({
            ...args,
        });
    }

    async create(args: Prisma.departmentsCreateManyArgs) {
        const { data } = args;
        const result = await this.departmentRepo.createMany(args).then((v) => v.count);
        const count = Array.isArray(data) ? data.length : 1;
        return result === count;
    }

    async update(args: Prisma.departmentsUpdateManyArgs) {
        const { data } = args;
        const result = await this.departmentRepo.updateMany(args).then((v) => v.count);
        const count = Array.isArray(data) ? data.length : 1;
        return result === count;
    }
}
