/* eslint-disable camelcase */
import { GetEmployeeQueryDto, GetHistoryQueryDto } from '@api-server/type/dto/employee.dto';
import { Injectable } from '@nestjs/common';
import { DepartmentRepository } from '@repository/rdbms/employee/department.repository';
import { EmployeeRepository } from '@repository/rdbms/employee/employee.repository';
import { JobHistoryRepository } from '@repository/rdbms/employee/job-history.repository';

@Injectable()
export class EmployeeService {
    constructor(
        private readonly employRepo: EmployeeRepository,
        private readonly historyRepo: JobHistoryRepository,
        private readonly departmentRepo: DepartmentRepository
    ) {}
    async getEmployee({ employee_id, email, job_id }: GetEmployeeQueryDto) {
        return await this.employRepo
            .get({
                where: { employee_id, email, job_id },
                include: {
                    other_employees: {
                        select: {
                            employee_id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            phone_number: true,
                            jobs: { select: { job_title: true } },
                        },
                    },
                    jobs: { select: { job_title: true } },
                    departments_employees_department_idTodepartments: { select: { department_name: true } },
                },
            })
            .then((v) =>
                v.map((v) => {
                    (v as any).commission_pct = v.commission_pct?.toString();
                    return v;
                })
            );
    }

    async getEmployHistory({ employee_id }: GetHistoryQueryDto) {
        const historyList = await this.historyRepo.get({ where: { employee_id } });
        if (historyList.length === 0) return historyList;
        const { employee_id: id, employees } = historyList[0] ?? {};
        return { ...(employees ?? {}), id, historyList };
    }

    async getDepartment() {
        return await this.departmentRepo.get();
    }

    findAll() {
        return `This action returns all employee`;
    }

    findOne(id: number) {
        return `This action returns a #${id} employee`;
    }

    update() {
        return `This action updates a employee`;
    }

    remove(id: number) {
        return `This action removes a #${id} employee`;
    }
}
