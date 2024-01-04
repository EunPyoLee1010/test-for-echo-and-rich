/* eslint-disable camelcase */
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class EmployeeListResponse {
    @Expose()
    @ApiProperty({ type: Number, description: '직원 ID', example: 100 })
    employee_id: number;

    @Expose()
    @ApiProperty({ type: String, description: '직원 Email', example: 'EMAIL' })
    email: string;

    @Expose()
    @ApiProperty({ type: String, description: '직원 이름', example: 'EUN PYO' })
    first_name: string;

    @Expose()
    @ApiProperty({ type: String, description: '직원 성', example: 'LEE' })
    last_name: string;

    @Expose()
    @ApiProperty({ type: String, description: '직원 전화번호', example: '123.456.789.0' })
    phone_number: string;

    @Expose()
    @Transform(({ value }) => (value ? Number(value) : undefined))
    @ApiProperty({ type: Number, description: '직원 급여', example: 27000 })
    salary: number;

    @Expose()
    @Transform(({ value }) => (value ? Number(value) : undefined))
    @ApiProperty({ type: Number, description: '커미션 비율', example: 0.4 })
    commission_pct: number;

    @Expose({ name: 'jobs' })
    @Transform(({ value }) => value.job_title)
    @ApiProperty({ type: String, description: '직급', example: 'IT Engineer' })
    job_title: string;
}

export class GetEmployeeResponse {
    @Expose()
    @ApiProperty({ type: Number, description: '직원 ID', example: 100 })
    employee_id: number;

    @Expose()
    @ApiProperty({ type: String, description: '직원 Email', example: 'EMAIL' })
    email: string;

    @Expose()
    @ApiProperty({ type: String, description: '직원 이름', example: 'EUN PYO' })
    first_name: string;

    @Expose()
    @ApiProperty({ type: String, description: '직원 성', example: 'LEE' })
    last_name: string;

    @Expose()
    @ApiProperty({ type: String, description: '직원 전화번호', example: '123.456.789.0' })
    phone_number: string;

    @Expose()
    @ApiProperty({ type: Date, description: '직원 고용 날짜', example: new Date() })
    hire_date: Date;

    @Expose()
    @Transform(({ obj }) => obj?.departments_employees_department_idTodepartments?.department_id)
    @ApiProperty({ type: Number, description: '부서 번호', example: 200 })
    department_id: number;

    @Expose()
    @Transform(({ obj }) => obj?.departments_employees_department_idTodepartments?.department_name)
    @ApiProperty({ type: String, description: '부서 이름', example: 'IT' })
    department_name: string;

    @Expose({ name: 'jobs' })
    @Transform(({ value }) => value?.job_title)
    @ApiProperty({ type: String, description: '직급', example: 'IT Engineer' })
    job_title: string;

    @Expose()
    @Transform(({ value }) => (value ? Number(value) : undefined))
    @ApiProperty({ type: Number, description: '직원 급여', example: 27000 })
    salary: number;

    @Expose()
    @Transform(({ value }) => (value ? Number(value) : undefined))
    @ApiProperty({ type: Number, description: '커미션 비율', example: 0.4 })
    commission_pct: number;

    @Expose({ name: 'other_employees' })
    @Type(() => EmployeeListResponse)
    employees: EmployeeListResponse;
}

export class GetEmployeeQueryDto {
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => (value === undefined ? undefined : +value))
    @ApiProperty({ type: Number, description: '직원 ID', example: 100 })
    employee_id?: number;

    @IsOptional()
    @IsString()
    @ApiProperty({ type: String, description: '직원 Email', example: 'EMAIL' })
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    @ApiProperty({ type: String, description: '직급 ID', example: 'JOB_ID' })
    job_id?: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => (value === undefined ? undefined : +value))
    @ApiProperty({ type: Number, description: '부서 ID', example: 200 })
    department_id?: number;
}

export class GetEmployeeHistoryQueryDto extends PickType(GetEmployeeQueryDto, ['employee_id']) {}

export class HistoryList {
    @Expose()
    @ApiProperty({type: Date, description: '입사일', example: new Date()})
    start_date: Date;

    @Expose()
    @ApiProperty({type: Date, description: '퇴사일', example: new Date()})
    end_date: Date;

    @Expose({ name: 'departments' })
    @Transform(({ value }) => value.department_name)
    @ApiProperty({type: String, description: '부서명', example: 'IT'})
    department_name: string;

    @Expose({ name: 'jobs' })
    @Transform(({ value }) => value.job_title)
    @ApiProperty({type: String, description: '직급', example: 'IT Engineer'})
    job_title: string;
}

export class GetHistoryResponse {
    @Expose({ name: 'id' })
    @ApiProperty({ type: Number, description: '직원 ID', example: 100 })
    employee_id: number;

    @Expose()
    @ApiProperty({ type: String, description: '직원 Email', example: 'EMAIL' })
    email: string;

    @Expose()
    @ApiProperty({ type: String, description: '직원 이름', example: 'EUN PYO' })
    first_name: string;

    @Expose()
    @ApiProperty({ type: String, description: '직원 성', example: 'LEE' })
    last_name: string;

    @Expose({ name: 'historyList' })
    @Type(() => HistoryList)
    job_history: any;
}

export class GetHistoryQueryDto {
    @IsNumber()
    @ApiProperty({ type: Number, description: '직원 ID', example: 100 })
    employee_id: number;
}
