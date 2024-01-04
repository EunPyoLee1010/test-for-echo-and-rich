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

@Controller('employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @Get()
    @Transform(GetEmployeeResponse)
    async get(@Query() { employee_id, email, job_id, department_id }: GetEmployeeQueryDto) {
        const employeeList = await this.employeeService.get({ employee_id, email, job_id, department_id });
        return employeeList;
    }

    @Get('/history')
    @Transform(GetHistoryResponse)
    async getHistory(@Query(EmployParseIntPipe) { employee_id }: GetEmployeeHistoryQueryDto) {
        const employeeHistory = await this.employeeService.getHistory({ employee_id });
        return employeeHistory;
    }
}
