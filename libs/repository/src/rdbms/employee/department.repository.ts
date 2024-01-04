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
            select: {
                department_id: true,
                department_name: true,
                employees_departments_manager_idToemployees: {
                    select: { employee_id: true, first_name: true, last_name: true, phone_number: true, email: true },
                },
                locations: {
                    select: {
                        countries: {
                            select: {
                                country_id: true,
                                country_name: true,
                                regions: { select: { region_name: true } },
                            },
                        },
                        postal_code: true,
                        city: true,
                        state_province: true,
                        street_address: true,
                    },
                },
            },
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
