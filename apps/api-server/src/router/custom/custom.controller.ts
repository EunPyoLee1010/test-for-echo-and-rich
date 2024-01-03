import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { CustomService } from './custom.service';
import { GetCustomParamDto } from '@api-server/type/dto/custom.dto';
import { Transform, TransformResponse } from '@module/common/interceptor/transform.interceptor';
import { Request, Response } from 'express';

@Controller('custom')
export class CustomController {
    constructor(private readonly customService: CustomService) {}

    @Get(':field/:id')
    @Transform(Boolean)
    async get(@Req() req: Request, @Res() res: Response, @Param() { field, id }: GetCustomParamDto) {
        const data = await this.customService.get({ field, id });
        return await TransformResponse({ req, res, data });
    }
}
