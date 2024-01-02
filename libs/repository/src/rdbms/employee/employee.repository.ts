/* eslint-disable camelcase */
import { Injectable } from '@nestjs/common';
import { RDBMSConnectionManager } from '../manager';
import { Prisma } from '@prisma/client';
import { ERROR_UNIQUE_USER_INFO_NOT_FOUND } from '@module/constant/error.constant';

@Injectable()
export class EmployeeRepository {
    private readonly employeeRepo: Prisma.employeesDelegate;
    constructor(private readonly rdbms: RDBMSConnectionManager) {
        this.employeeRepo = this.rdbms.client.employees;
    }

    async get(args?: Prisma.employeesFindManyArgs) {
        return this.employeeRepo.findMany(args);
    }

    async create(args: Prisma.employeesCreateManyArgs) {
        const { data } = args;
        const result = await this.employeeRepo.createMany(args).then((v) => v.count);
        const count = Array.isArray(data) ? data.length : 1;
        return result === count;
    }

    async update(args: Prisma.employeesUpdateManyArgs) {
        const { data } = args;
        const result = await this.employeeRepo.updateMany(args).then((v) => v.count);
        const count = Array.isArray(data) ? data.length : 1;
        return result === count;
    }

    async delete({ employee_id }: { employee_id: number }) {
        if (!employee_id) return ERROR_UNIQUE_USER_INFO_NOT_FOUND;
        const deleteResult = await this.employeeRepo.delete({ where: { employee_id } });
        return deleteResult;
    }
}
