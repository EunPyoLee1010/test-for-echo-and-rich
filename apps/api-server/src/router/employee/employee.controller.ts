/* eslint-disable camelcase */
import { Controller, Get, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import {
    GetEmployeeHistoryQueryDto,
    GetEmployeeQueryDto,
    GetEmployeeResponse,
    GetHistoryResponse,
} from '@api-server/type/dto/employee.dto';
import { Transform } from '@module/common/interceptor/transform.interceptor';
import { EmployParseIntPipe } from '@api-server/common/pipe/employee.pipe';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponse } from '@module/module/error';

@Controller('employee')
@ApiTags('employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @Get()
    @Transform(GetEmployeeResponse)
    @ApiOperation({
        summary: 'Empolyee 정보 조회',
        description: 'employee_id, email, jod_id, department_id 정보를 통해 직원 정보를 조회합니다.',
    })
    @ApiQuery({name: 'employee_id', description: '조회하려는 직원 ID', 'example': 100, type: 'number'})
    @ApiQuery({name: 'email', description: '조회하려는 직원 Email', 'example': 'EMAIL', type: 'string'})
    @ApiQuery({name: 'job_id', description: '조회하려는 직원의 직업 ID', 'example': 101, type: 'number'})
    @ApiQuery({name: 'department_id', description: '조회하려는 직원의 부서 ID', 'example': 102, type: 'number'})
    @ApiOkResponse({type: GetEmployeeResponse, description: '응답 성공'})
    @ApiBadRequestResponse({type: ErrorResponse , description: '응답 실패'})
    async get(@Query() { employee_id, email, job_id, department_id }: GetEmployeeQueryDto) {
        const employeeList = await this.employeeService.get({ employee_id, email, job_id, department_id });
        return employeeList;
    }

    @Get('/history')
    @Transform(GetHistoryResponse)
    @ApiOperation({
        summary: 'Empolyee 경력 정보 조회',
        description: '직원 ID를 통해 직원 경력 정보를 조회합니다.',
    })
    @ApiQuery({name: 'employee_id', description: '조회하려는 직원 ID', 'example': 100, type: 'number'})
    @ApiOkResponse({type: GetHistoryResponse, description: '응답 성공'})
    @ApiBadRequestResponse({type: ErrorResponse , description: '응답 실패'})
    async getHistory(@Query(EmployParseIntPipe) { employee_id }: GetEmployeeHistoryQueryDto) {
        const employeeHistory = await this.employeeService.getHistory({ employee_id });
        return employeeHistory;
    }
}
