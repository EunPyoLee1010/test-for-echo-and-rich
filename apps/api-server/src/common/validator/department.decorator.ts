/* eslint-disable camelcase */
import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { DepartmentRepository } from '@repository/rdbms/employee/department.repository';
import { ERROR_DATABASE_DEPARTMENT_SELECT } from '@module/constant/error.constant';

@ValidatorConstraint()
@Injectable()
export class DepartmentIdValidator implements ValidatorConstraintInterface {
    constructor(private readonly departmentRepo: DepartmentRepository) {}
    async validate(department_id: number) {
        try {
            const isExist = await this.departmentRepo.get({ where: { department_id } });
            return isExist.length > 0;
        } catch (e) {
            console.log(e);
            throw new BadRequestException(ERROR_DATABASE_DEPARTMENT_SELECT);
        }
    }

    defaultMessage(): string {
        return '존재하지 않는 부서 입니다.';
    }
}
