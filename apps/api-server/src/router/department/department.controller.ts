/* eslint-disable camelcase */
import { Body, Controller, Get, Param, Put, Query, UsePipes } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { Transform } from '@module/common/interceptor/transform.interceptor';
import {
    GetDepartmentQueryDto,
    GetDepartmentResponse,
    UpdateDepartmentBodyDto,
    UpdateDepartmentParamDto,
} from '@api-server/type/dto/department.dto';
import { DepartmentParseIntPipe } from '@api-server/common/pipe/department.pipe';
import { isErrorType } from '@module/module/error';
import { ResultSuccessResponse } from '@api-server/type/dto/default.dto';

@Controller('department')
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) {}

    @Get()
    @Transform(GetDepartmentResponse)
    @UsePipes(DepartmentParseIntPipe)
    async getDepartment(@Query() { department_id, department_name }: GetDepartmentQueryDto) {
        const departmentList = await this.departmentService.get({ department_id, department_name });
        return departmentList;
    }

    @Put(':department_id')
    @Transform(ResultSuccessResponse)
    async update(
        @Param(DepartmentParseIntPipe) { department_id }: UpdateDepartmentParamDto,
        @Body() { salaryPercent, manager_id }: UpdateDepartmentBodyDto
    ) {
        const updateResult = await this.departmentService.update({ department_id }, { manager_id, salaryPercent });
        if (isErrorType(updateResult)) return updateResult;
        return { result: updateResult, id: department_id };
    }
}
