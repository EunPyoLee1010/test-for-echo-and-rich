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
import { ErrorResponse, isErrorType } from '@module/module/error';
import { ResultSuccessResponse } from '@api-server/type/dto/default.dto';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';

@Controller('department')
@ApiTags('department')
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) {}

    @Get()
    @Transform(GetDepartmentResponse)
    @UsePipes(DepartmentParseIntPipe)
    @ApiOperation({
        summary: 'Department 정보 조회',
        description: 'department_id, department_name 정보를 통해 부서 및 위치 정보를 조회합니다.',
    })
    @ApiQuery({ type: GetDepartmentQueryDto })
    @ApiOkResponse({ type: GetDepartmentResponse, description: '응답 성공' })
    @ApiBadRequestResponse({ type: ErrorResponse, description: '응답 실패' })
    async getDepartment(@Query() { department_id, department_name }: GetDepartmentQueryDto) {
        const departmentList = await this.departmentService.get({ department_id, department_name });
        return departmentList;
    }

    @Put(':department_id')
    @Transform(ResultSuccessResponse)
    @ApiOperation({
        summary: 'Department 관련 정보 수정',
        description: '부서에 포함된 직원들의 월급 퍼센트 조정 및 관리자를 변경합니다.',
    })
    @ApiParam({ name: 'department_id', type: UpdateDepartmentParamDto })
    @ApiBody({ type: UpdateDepartmentBodyDto })
    @ApiOkResponse({ type: ResultSuccessResponse, description: '응답 성공' })
    @ApiBadRequestResponse({ type: ErrorResponse, description: '응답 실패' })
    async update(
        @Param(DepartmentParseIntPipe) { department_id }: UpdateDepartmentParamDto,
        @Body() { salaryPercent, manager_id }: UpdateDepartmentBodyDto
    ) {
        const updateResult = await this.departmentService.update({ department_id }, { manager_id, salaryPercent });
        if (isErrorType(updateResult)) return updateResult;
        return { result: updateResult, id: department_id };
    }
}
