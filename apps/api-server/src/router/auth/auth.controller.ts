import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DevGuard } from '@module/common/guard/dev.guard';
import { RequestInfo } from '@module/common/decorator/request.decorator';
import { Response } from 'express';
import { TRequestInfo } from '@module/type/request.type';
import { Transform } from '@module/common/interceptor/transform.interceptor';
import {
    GetAuthCallbackDTO,
    GetAuthCallbackResponse,
    GetAuthTestDto,
    PostRegisterBodyDto,
} from '@api-server/type/dto/auth.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponse, isErrorType } from '@module/module/error';
import { OauthToken } from '@api-server/common/decorator/oauth.decorator';
import { TOauthTokenPayload } from '@module/type/oauth.type';
import { OauthGuard } from '@api-server/common/guard/oauth.guard';
import { RegisterGuard } from '@api-server/common/guard/register.guard';
import { LogService } from '@module/module/log/log.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly logger: LogService) {}

    @Get('test')
    @UseGuards(DevGuard)
    @ApiOperation({
        summary: 'Oauth 테스트용 endpoint',
        description: 'Google, Kakao 등 Oauth provider들의 Oauth를 테스트하는 endpoint 입니다.',
    })
    @ApiQuery({ name: 'type', type: 'query', required: true, description: 'Oauth Provider', example: 'google' })
    @ApiResponse({
        schema: { type: 'string', example: 'https://accounts.google.com/o/oauth2/v2/auth' },
        description: 'Oauth 로그인이 가능한 endpoint로 redirect 시켜줍니다.',
    })
    test(@Query() { type }: GetAuthTestDto, @Res() res: Response) {
        const url = this.authService.getUrl({ type });
        return res.redirect(url);
    }

    @Get('callback')
    @Transform(GetAuthCallbackResponse)
    @ApiOperation({
        summary: 'Oauth Callback endpoint',
        description: 'Web 플랫폼에서 Oauth 인증 후 해당 callback 처리를 담당하는 endpoint 입니다.',
    })
    @ApiQuery({ name: 'type', type: 'query', required: true, description: 'Oauth Provider', example: 'google' })
    @ApiQuery({ name: 'code', type: 'query', required: true, description: 'Oauth Callback Code', example: '12345...' })
    @ApiResponse({ type: GetAuthCallbackResponse, status: '2XX', description: '정상 요청을 통한 Token 획득 성공' })
    @ApiResponse({ type: ErrorResponse, status: '2XX', description: 'Oauth 로그인 실패' })
    async callback(
        @Query() { code, type, state }: GetAuthCallbackDTO,
        @RequestInfo() { ipAddress, userAgent }: TRequestInfo
    ) {
        const token = await this.authService.getToken({ code, type, state }, { ipAddress, userAgent });
        return token;
    }

    @Post('login')
    @UseGuards(OauthGuard)
    @Transform(GetAuthCallbackResponse)
    @ApiOperation({
        summary: 'Oauth Login endpoint',
        description: '앱 플랫폼에서 Oauth 인증 후 로그인을 처리하는 endpoint 입니다.',
    })
    @ApiQuery({ name: 'idToken', type: 'header', required: true, description: 'Oauth id token' })
    @ApiQuery({ name: 'accessToken', type: 'header', required: true, description: 'Oauth access Token' })
    @ApiResponse({ type: GetAuthCallbackResponse, status: '2XX', description: '정상 요청을 통한 Token 획득 성공' })
    @ApiResponse({ type: ErrorResponse, status: '2XX', description: 'Oauth 로그인 실패' })
    async login(
        @OauthToken() oauthTokenPayload: TOauthTokenPayload,
        @RequestInfo() { ipAddress, userAgent }: TRequestInfo
    ) {
        const { loginId, name } = oauthTokenPayload.payload ?? {};
        const tokenResult = await this.authService.login(oauthTokenPayload, { ipAddress, userAgent });
        if (isErrorType(tokenResult) || tokenResult.loginResult === false) {
            this.logger.error('Oauth2.0 로그인에 실패하였습니다.', { loginId, name });
            return tokenResult;
        }
        this.logger.log('로그인에 성공하였습니다', { loginId, name });
        return tokenResult;
    }

    @Post('register')
    @UseGuards(RegisterGuard)
    @UseGuards(OauthGuard)
    @Transform(GetAuthCallbackResponse)
    @ApiOperation({
        summary: 'Oauth Register endpoint',
        description: '앱 플랫폼에서 Oauth 인증 후 회원가입을 처리하는 endpoint 입니다.',
    })
    @ApiQuery({ name: 'idToken', type: 'header', required: true, description: 'Oauth id token' })
    @ApiQuery({ name: 'accessToken', type: 'header', required: true, description: 'Oauth access Token' })
    @ApiBody({ type: PostRegisterBodyDto, required: true, description: '회원가입을 위한 추가 정보' })
    @ApiResponse({ type: GetAuthCallbackResponse, status: '2XX', description: '정상 요청을 통한 Token 획득 성공' })
    @ApiResponse({ type: ErrorResponse, status: '2XX', description: 'Oauth 로그인 실패' })
    async register(
        @OauthToken() oauthTokenPayload: TOauthTokenPayload,
        @Body() additionalInfo: PostRegisterBodyDto,
        @RequestInfo() { ipAddress, userAgent }: TRequestInfo
    ) {
        const { loginId, name } = oauthTokenPayload.payload ?? {};
        const token = await this.authService.register(oauthTokenPayload, additionalInfo, { ipAddress, userAgent });
        if (isErrorType(token)) {
            this.logger.error('Oauth2.0 회원가입을 실패하였습니다.', { loginId, name });
            return token;
        }
        this.logger.log('회원가입에 성공하였습니다', { loginId, name });
        return token;
    }
}
