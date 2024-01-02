/* eslint-disable camelcase */
import { Controller, Get, ParseIntPipe, Query, UsePipes } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { GetEmployeeQueryDto, GetEmployeeResponse, GetHistoryResponse } from '@api-server/type/dto/employee.dto';
import { Transform } from '@module/common/interceptor/transform.interceptor';
import { EmployParseIntPipe } from '@api-server/common/pipe/employee.pipe';

@Controller('employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @Get()
    @Transform(GetEmployeeResponse)
    @UsePipes(EmployParseIntPipe)
    async get(@Query() { employee_id, email, job_id }: GetEmployeeQueryDto) {
        const employeeList = await this.employeeService.getEmployee({ employee_id, email, job_id });
        return employeeList;
    }

    @Get('/history')
    @Transform(GetHistoryResponse)
    async getHistory(@Query('employee_id', ParseIntPipe) employee_id: number) {
        const employeeHistory = await this.employeeService.getEmployHistory({ employee_id });
        return employeeHistory;
    }
}
