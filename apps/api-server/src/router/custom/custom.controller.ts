import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { CustomService } from './custom.service';
import { GetCustomCommentResponse, GetCustomParamDto, GetCustomPostResponse } from '@api-server/type/dto/custom.dto';
import { TransformResponse } from '@module/common/interceptor/transform.interceptor';
import { Request, Response } from 'express';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ErrorResponse } from '@module/module/error';

@Controller('/custom')
@ApiTags('custom')
export class CustomController {
    constructor(private readonly customService: CustomService) {}

    @Get('/:field/:id')
    @ApiOperation({
        summary: 'Department 정보 조회',
        description: 'department_id, department_name 정보를 통해 부서 및 위치 정보를 조회합니다.',
    })
    @ApiParam({ name: '', type: GetCustomParamDto })
    @ApiOkResponse({ type: GetCustomPostResponse, description: '응답 성공 (Posts)' })
    @ApiOkResponse({ type: GetCustomCommentResponse, description: '응답 성공 (Comments)' })
    @ApiBadRequestResponse({ type: ErrorResponse, description: '응답 실패' })
    async get(@Req() req: Request, @Res() res: Response, @Param() { field, id }: GetCustomParamDto) {
        const data = await this.customService.get({ field, id });
        return res.json(TransformResponse({ req, res, data }));
    }
}
