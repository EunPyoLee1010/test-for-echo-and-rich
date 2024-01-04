/* eslint-disable camelcase */
import { IsValidDepartment } from '@api-server/common/decorator/department.decorator';
import { IsValidEmployee } from '@api-server/common/decorator/employee.decorator';
import { Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { GetEmployeeResponse } from './employee.dto';

export class GetLocationResponse {
    @Expose()
    @Transform(({ obj }) => obj?.countries?.country_name)
    country_name: string;

    @Expose()
    @Transform(({ obj }) => obj?.countries?.country_id)
    country_id: string;

    @Expose({ name: 'countries' })
    @Transform(({ value }) => value?.regions?.region_name)
    region_name: string;

    @Expose()
    postal_code: string;

    @Expose()
    city: string;

    @Expose()
    state_province: string;

    @Expose()
    street_address: string;
}

export class GetDepartmentResponse {
    @Expose()
    department_id: number;

    @Expose()
    department_name: string;

    @Expose({ name: 'employees_departments_manager_idToemployees' })
    @Transform(({ value }) => value ?? undefined)
    @Type(() => GetEmployeeResponse)
    manager: GetEmployeeResponse;

    @Expose({ name: 'locations' })
    @Type(() => GetLocationResponse)
    location: GetLocationResponse;
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
    @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
    @Min(0)
    @Max(100)
    salaryPercent?: number;

    @IsValidEmployee()
    @IsOptional()
    manager_id?: number;
}
