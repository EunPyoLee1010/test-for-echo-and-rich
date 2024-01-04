/* eslint-disable camelcase */
import { GetEmployeeQueryDto, GetHistoryQueryDto } from '@api-server/type/dto/employee.dto';
import { ERROR_DATABASE_EMPLOYEE_SELECT, ERROR_DATABASE_HISTORY_SELECT } from '@module/constant/error.constant';
import { Injectable } from '@nestjs/common';
import { EmployeeRepository } from '@repository/rdbms/employee/employee.repository';
import { JobHistoryRepository } from '@repository/rdbms/employee/job-history.repository';

@Injectable()
export class EmployeeService {
    constructor(private readonly employRepo: EmployeeRepository, private readonly historyRepo: JobHistoryRepository) {}
    async get({ employee_id, email, job_id, department_id }: GetEmployeeQueryDto) {
        try {
            const employeeList = await this.employRepo.get({ where: { employee_id, email, job_id, department_id } });
            return employeeList.map((v) => {
                (v as any).commission_pct = v.commission_pct ? Number(v.commission_pct) : null;
                (v as any).salary = v.salary ? Number(v.salary) : null;
                return v;
            });
        } catch (e) {
            console.log(e);
            return ERROR_DATABASE_EMPLOYEE_SELECT;
        }
    }

    async getHistory({ employee_id }: GetHistoryQueryDto) {
        try {
            const historyList = await this.historyRepo.get({ where: { employee_id } });
            if (historyList.length === 0) return historyList;
            const { employee_id: id, employees } = historyList[0] ?? {};
            return { ...(employees ?? {}), id, historyList };
        } catch (e) {
            console.log(e);
            return ERROR_DATABASE_HISTORY_SELECT;
        }
    }
}
