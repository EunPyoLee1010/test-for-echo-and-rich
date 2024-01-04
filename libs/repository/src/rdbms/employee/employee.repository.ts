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
        const employee_id = args?.where?.employee_id;
        const department_id = args?.where?.department_id;
        return this.employeeRepo.findMany({
            ...args,
            include: {
                other_employees: employee_id
                    ? {
                          select: {
                              employee_id: true,
                              first_name: true,
                              last_name: true,
                              email: true,
                              phone_number: true,
                              jobs: { select: { job_title: true } },
                          },
                      }
                    : false,
                jobs: { select: { job_title: true } },
                departments_employees_department_idTodepartments: {
                    select: { department_name: true, department_id: department_id !== undefined },
                },
            },
        });
    }

    async create(args: Prisma.employeesCreateManyArgs) {
        const { data } = args;
        const result = await this.employeeRepo.createMany(args).then((v) => v.count);
        const count = Array.isArray(data) ? data.length : 1;
        return result === count;
    }

    async update(args: Prisma.employeesUpdateManyArgs) {
        await this.employeeRepo.updateMany(args).then((v) => v.count);
        return true;
    }

    async delete({ employee_id }: { employee_id: number }) {
        if (!employee_id) return ERROR_UNIQUE_USER_INFO_NOT_FOUND;
        const deleteResult = await this.employeeRepo.delete({ where: { employee_id } });
        return deleteResult;
    }
}
