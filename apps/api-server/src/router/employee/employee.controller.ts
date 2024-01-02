/* eslint-disable camelcase */
import { Controller, Delete, Get, Param, ParseIntPipe, Query, UsePipes } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { GetEmployeeQueryDto, GetEmployeeResponse, GetHistoryResponse } from '@api-server/type/dto/employee.dto';
import { Transform } from '@module/common/interceptor/transform.interceptor';
import { EmployParseIntPipe } from '@api-server/common/pipe/employee.pipe';
import { ERROR_DATABASE_USER_SELECT } from '@module/constant/error.constant';

@Controller('employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @Get()
    @Transform(GetEmployeeResponse)
    @UsePipes(EmployParseIntPipe)
    async get(@Query() { employee_id, email, job_id }: GetEmployeeQueryDto) {
        try {
            const employeeList = await this.employeeService.getEmployee({ employee_id, email, job_id });
            return employeeList;
        } catch (e) {
            console.log(e);
            return ERROR_DATABASE_USER_SELECT;
        }
    }

    @Get('/history')
    @Transform(GetHistoryResponse)
    async getHistory(@Query('employee_id', ParseIntPipe) employee_id: number) {
        const employeeHistory = await this.employeeService.getEmployHistory({ employee_id });
        return employeeHistory;
    }

    @Get('/department')
    @Transform(Boolean)
    async getDepartment() {
        const department = await this.employeeService.getDepartment();
        console.log(department);
        return department;
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.employeeService.remove(+id);
    }
}
