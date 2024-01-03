/* eslint-disable camelcase */
import {
    GetDepartmentQueryDto,
    UpdateDepartmentBodyDto,
    UpdateDepartmentParamDto,
} from '@api-server/type/dto/department.dto';
import { ERROR_DATABASE_DEPARTMENT_SELECT, ERROR_DATABASE_DEPARTMENT_UPDATE } from '@module/constant/error.constant';
import { Injectable } from '@nestjs/common';
import { DepartmentRepository } from '@repository/rdbms/employee/department.repository';
import { EmployeeRepository } from '@repository/rdbms/employee/employee.repository';

@Injectable()
export class DepartmentService {
    constructor(
        private readonly departmentRepo: DepartmentRepository,
        private readonly employeeRepo: EmployeeRepository
    ) {}
    async get({ department_id, department_name }: GetDepartmentQueryDto) {
        try {
            const departmentList = await this.departmentRepo.get({ where: { department_id, department_name } });
            return departmentList;
        } catch (e) {
            console.log(e);
            return ERROR_DATABASE_DEPARTMENT_SELECT;
        }
    }

    async update({ department_id }: UpdateDepartmentParamDto, { manager_id, salaryPercent }: UpdateDepartmentBodyDto) {
        try {
            const updateResult = await this.employeeRepo.update({
                where: { department_id },
                data: { salary: { multiply: (salaryPercent ?? 0) * 0.01 + 1 }, manager_id },
            });
            return updateResult;
        } catch (e) {
            console.log(e);
            return ERROR_DATABASE_DEPARTMENT_UPDATE;
        }
    }
}
