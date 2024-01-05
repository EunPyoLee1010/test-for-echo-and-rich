/* eslint-disable camelcase */
import { IsValidDepartment } from '@api-server/common/decorator/department.decorator';
import { IsValidEmployee } from '@api-server/common/decorator/employee.decorator';
import { Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { GetEmployeeResponse } from './employee.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetLocationResponse {
    @Expose()
    @Transform(({ obj }) => obj?.countries?.country_name)
    @ApiProperty({ type: String, description: '국가명', example: 'ITALY' })
    country_name: string;

    @Expose()
    @Transform(({ obj }) => obj?.countries?.country_id)
    @ApiProperty({ type: String, description: '국가 ID(국가 코드)', example: 'IT' })
    country_id: string;

    @Expose({ name: 'countries' })
    @Transform(({ value }) => value?.regions?.region_name)
    @ApiProperty({ type: String, description: '지역명', example: 'Europe' })
    region_name: string;

    @Expose()
    @ApiProperty({ type: String, description: '우편번호', example: '00989' })
    postal_code: string;

    @Expose()
    @ApiProperty({ type: String, description: '수도명', example: 'Roma' })
    city: string;

    @Expose()
    @ApiProperty({ type: String, description: '주 이름', example: 'Taxes' })
    state_province: string;

    @Expose()
    @ApiProperty({ type: String, description: '도로명 주소', example: '' })
    street_address: string;
}

export class GetDepartmentResponse {
    @Expose()
    @ApiProperty({ type: Number, description: '부서 ID', example: 200 })
    department_id: number;

    @Expose()
    @ApiProperty({ type: String, description: '부서 이름', example: 'IT' })
    department_name: string;

    @Expose({ name: 'employees_departments_manager_idToemployees' })
    @Transform(({ value }) => value ?? undefined)
    @Type(() => GetEmployeeResponse)
    @ApiProperty({ type: GetEmployeeResponse, description: '부서 관리자 정보' })
    manager: GetEmployeeResponse;

    @Expose({ name: 'locations' })
    @Type(() => GetLocationResponse)
    @ApiProperty({ type: GetLocationResponse, description: '부서 위치 정보' })
    location: GetLocationResponse;
}

export class GetDepartmentQueryDto {
    @IsOptional()
    @IsNumber()
    @ApiProperty({ type: Number, description: '부서 ID', example: 200 })
    department_id?: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ type: String, description: '부서 이름', example: 'IT' })
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
    @ApiProperty({ type: Number, description: '급여 인상률 (0 ~ 100)', example: 50 })
    salaryPercent?: number;

    @IsValidEmployee()
    @IsOptional()
    @ApiProperty({ type: Number, description: '관리자 직원 ID', example: 101 })
    manager_id?: number;
}
