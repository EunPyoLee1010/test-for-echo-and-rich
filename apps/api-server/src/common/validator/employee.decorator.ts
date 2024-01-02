/* eslint-disable camelcase */
import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ERROR_DATABASE_EMPLOYEE_SELECT } from '@module/constant/error.constant';
import { EmployeeRepository } from '@repository/rdbms/employee/employee.repository';

@ValidatorConstraint()
@Injectable()
export class EmployeetIdValidator implements ValidatorConstraintInterface {
    constructor(private readonly employeeRepo: EmployeeRepository) {}
    async validate(employee_id: number) {
        try {
            const isExist = await this.employeeRepo.get({ where: { employee_id } });
            return isExist.length > 0;
        } catch (e) {
            console.log(e);
            throw new BadRequestException(ERROR_DATABASE_EMPLOYEE_SELECT);
        }
    }

    defaultMessage(): string {
        return '존재하지 않는 직원 입니다.';
    }
}
