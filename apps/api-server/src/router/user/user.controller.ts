import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Token } from '@module/common/decorator/token.decorator';
import { TTokenPayload } from '@module/type/token.type';
import { ErrorResponse, isErrorType } from '@module/module/error';
import { DeleteUserResponse, GetUserResponse } from '@api-server/type/dto/user.dto';
import { Transform } from '@module/common/interceptor/transform.interceptor';
import { JwtGuard } from '@module/common/guard/token.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LogService } from '@module/module/log/log.service';

@Controller('user')
@UseGuards(JwtGuard)
@ApiTags('User')
@ApiBearerAuth('JWT')
export class UserController {
    constructor(private readonly logger: LogService, private readonly userService: UserService) {}

    @Get()
    @Transform(GetUserResponse)
    @ApiOperation({
        summary: 'User 정보 조회',
        description: 'Token의 정보를 통해 User 정보를 조회합니다.',
    })
    @ApiResponse({ type: GetUserResponse, status: '2XX', description: '정상적인 Token을 가지고 유저 조회' })
    @ApiResponse({ type: ErrorResponse, status: '2XX', description: 'User 조회 실패' })
    async get(@Token() token: TTokenPayload) {
        const { userId } = token;
        const userInfo = await this.userService.get({ userId });
        return userInfo;
    }

    @Delete()
    @Transform(DeleteUserResponse)
    @ApiOperation({
        summary: 'User 정보 삭제',
        description: 'User 본인의 정보를 삭제합니다. 즉, 회원 탈퇴합니다.',
    })
    @ApiResponse({ type: String, status: '2XX', description: 'User 회원 탈퇴 성공' })
    @ApiResponse({ type: ErrorResponse, status: '2XX', description: 'User 회원 탈퇴 실패' })
    async delete(@Token() token: TTokenPayload) {
        const deleteResult = await this.userService.delete(token);
        if (!isErrorType(deleteResult)) {
            this.logger.log(`유저 회원 탈퇴를 완료했습니다.`, token);
        }
        return deleteResult;
    }
}
