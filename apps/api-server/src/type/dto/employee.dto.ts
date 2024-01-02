/* eslint-disable camelcase */
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

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

    @Exclude()
    salary: number;

    @Transform(({ value }) => (value ? +value : undefined))
    @Expose()
    commission_pct: number;

    @Expose({ name: 'other_employees' })
    employees: any;
}

export class GetEmployeeQueryDto {
    @IsOptional()
    @IsString()
    @ApiProperty()
    employee_id?: number;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    job_id?: string;
}

export class HistoryList {
    @Expose()
    start_date: Date;

    @Expose()
    end_date: Date;

    @Expose()
    departments: any;

    @Expose()
    jobs: any;
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
