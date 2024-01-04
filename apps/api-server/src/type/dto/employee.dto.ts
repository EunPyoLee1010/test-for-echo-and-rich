/* eslint-disable camelcase */
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class EmployeeListResponse {
    @Expose()
    employee_id: number;

    @Expose()
    email: string;

    @Expose()
    first_name: string;

    @Expose()
    last_name: string;

    @Expose()
    phone_number: string;

    @Expose()
    @Transform(({ value }) => (value ? Number(value) : undefined))
    salary: number;

    @Expose()
    @Transform(({ value }) => (value ? Number(value) : undefined))
    commission_pct: number;

    @Expose({ name: 'jobs' })
    @Transform(({ value }) => value.job_title)
    job_title: string;
}

export class GetEmployeeResponse {
    @Expose()
    employee_id: number;

    @Expose()
    email: string;

    @Expose()
    first_name: string;

    @Expose()
    last_name: string;

    @Expose()
    phone_number: string;

    @Expose()
    hire_date: Date;

    @Expose()
    @Transform(({ obj }) => obj?.departments_employees_department_idTodepartments?.department_id)
    department_id: number;

    @Expose()
    @Transform(({ obj }) => obj?.departments_employees_department_idTodepartments?.department_name)
    department_name: string;

    @Expose({ name: 'jobs' })
    @Transform(({ value }) => value?.job_title)
    job_title: string;

    @Expose()
    @Transform(({ value }) => (value ? Number(value) : undefined))
    salary: number;

    @Expose()
    @Transform(({ value }) => (value ? Number(value) : undefined))
    commission_pct: number;

    @Expose({ name: 'other_employees' })
    @Type(() => EmployeeListResponse)
    employees: EmployeeListResponse;
}

export class GetEmployeeQueryDto {
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => (value === undefined ? undefined : +value))
    @ApiProperty()
    employee_id?: number;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    job_id?: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => (value === undefined ? undefined : +value))
    @ApiProperty()
    department_id?: number;
}

export class GetEmployeeHistoryQueryDto extends PickType(GetEmployeeQueryDto, ['employee_id']) {}

export class HistoryList {
    @Expose()
    start_date: Date;

    @Expose()
    end_date: Date;

    @Expose({ name: 'departments' })
    @Transform(({ value }) => value.department_name)
    department_name: string;

    @Expose({ name: 'jobs' })
    @Transform(({ value }) => value.job_title)
    job_title: string;
}

export class GetHistoryResponse {
    @Expose({ name: 'id' })
    employee_id: number;

    @Expose()
    email: string;

    @Expose()
    first_name: string;

    @Expose()
    last_name: string;

    @Expose({ name: 'historyList' })
    @Type(() => HistoryList)
    job_history: any;
}

export class GetHistoryQueryDto {
    @IsNumber()
    employee_id: number;
}

export class GetLocationQueryDto {}

export class UpdateSalaryBodyDto {}

export class UpdateEmployBodyDto {}
