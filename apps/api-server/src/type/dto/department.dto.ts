/* eslint-disable camelcase */
import { IsValidDepartment } from '@api-server/common/decorator/department.decorator';
import { IsValidEmployee } from '@api-server/common/decorator/employee.decorator';
import { Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetDepartmentResponse {
    @Expose()
    department_id: number;

    @Expose()
    department_name: string;

    @Expose({ name: 'employees_departments_manager_idToemployees' })
    manager: any;

    @Expose()
    locations: any;
}

export class GetDepartmentQueryDto {
    @IsOptional()
    @IsNumber()
    department_id?: number;

    @IsString()
    @IsOptional()
    department_name?: string;
}

export class UpdateDepartmentParamDto {
    @IsValidDepartment()
    department_id: number;
}

export class UpdateDepartmentBodyDto {
    @IsOptional()
    @IsNumber({ allowInfinity: false, allowNaN: false })
    salaryPercent?: number;

    @IsValidEmployee()
    @IsOptional()
    manager_id?: number;
}
