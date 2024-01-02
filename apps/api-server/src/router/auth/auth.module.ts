import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleOauthService } from '@api-server/core/oauth/provider/google.auth';
import { KakaoOauthService } from '@api-server/core/oauth/provider/kakao.auth';
import { UserService } from '../user/user.service';
import { RouterModule } from '@nestjs/core';
import { NaverOauthService } from '@api-server/core/oauth/provider/naver.auth';

const authModuleList = [];

@Module({
    imports: [
        ...authModuleList,
        RouterModule.register(
            authModuleList.map((module) => ({
                path: '/auth',
                module,
            }))
        ),
    ],
    controllers: [AuthController],
    providers: [AuthService, GoogleOauthService, KakaoOauthService, NaverOauthService, UserService],
})
export class AuthModule {}
