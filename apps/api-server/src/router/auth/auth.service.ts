/* eslint-disable camelcase */
import { Injectable } from '@nestjs/common';
import { OauthService } from '@api-server/core/oauth/oauth.service';
import { GoogleOauthService } from '@api-server/core/oauth/provider/google.auth';
import { KakaoOauthService } from '@api-server/core/oauth/provider/kakao.auth';
import { UserService } from '../user/user.service';
import { v4 } from 'uuid';
import { createHash, createSalt, encryptJwtSecretKey } from '@module/module/encryption';
import { Prisma, User } from '@prisma/client';
import {
    ERROR_CREATE_TOKEN,
    ERROR_CREATE_USER,
    ERROR_LOGIN_ID_EXIST,
    ERROR_OAUTH_FAILED,
    ERROR_TYPE,
} from '@module/constant/error.constant';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { TRequestInfo } from '@module/type/request.type';
import { TTokenPayload } from '@module/type/token.type';
import {
    GetAuthCallbackDTO,
    GetAuthCallbackResponse,
    GetAuthTestDto,
    PostRegisterBodyDto,
} from '@api-server/type/dto/auth.dto';
import { TOauthProvider, TOauthTokenPayload } from '@module/type/oauth.type';
import { isErrorType } from '@module/module/error';
import { NaverOauthService } from '@api-server/core/oauth/provider/naver.auth';
import { CacheService } from '@repository/cache/cache.service';
import { LogService } from '@module/module/log/log.service';
import { SYSTEM_TOKEN } from '@module/constant/log.constant';

@Injectable()
export class AuthService {
    private readonly oAuthManager: Record<string, OauthService>;
    constructor(
        private readonly logger: LogService,
        private readonly config: ConfigService,
        private readonly google: GoogleOauthService,
        private readonly kakao: KakaoOauthService,
        private readonly naver: NaverOauthService,
        private readonly userService: UserService,
        private readonly cacheService: CacheService
    ) {
        this.oAuthManager = {
            google,
            kakao,
            naver,
        };
    }

    getUrl({ type }: GetAuthTestDto) {
        return this.oAuthManager[type]?.getAuthUrl();
    }

    async getToken(
        { code, type, state }: GetAuthCallbackDTO,
        requestInfo: TRequestInfo
    ): Promise<GetAuthCallbackResponse | Readonly<ERROR_TYPE>> {
        try {
            const token = await this.oAuthManager[type]?.getTokenFromCode({ code, state });
            const payload = await this.oAuthManager[type]?.getOauthInfo(token);
            if (payload === undefined) {
                this.logger.error(`${type} Oauth2 인증에 실패하였습니다.`, SYSTEM_TOKEN);
                return ERROR_OAUTH_FAILED;
            }

            const { idToken, accessToken } = token;
            return await this.login({ type, payload, idToken, accessToken }, requestInfo);
        } catch (e) {
            console.log(e);
            return ERROR_CREATE_USER;
        }
    }

    async createJwtToken(payload: TTokenPayload, requestInfo: TRequestInfo) {
        try {
            const JWT_SECRET = this.config.get('JWT_SECRET');
            const expiresIn = this.config.get('JWT_EXPIRE_TIME');
            const token = jwt.sign(payload, encryptJwtSecretKey(requestInfo, JWT_SECRET), { expiresIn });
            return { token, expiresIn };
        } catch (e) {
            console.log(e);
            return ERROR_CREATE_TOKEN;
        }
    }

    async verify(type: TOauthProvider, { idToken, accessToken }: { idToken: string; accessToken: string }) {
        const { verified, payload } = await this.oAuthManager[type]?.verifyIdToken(idToken);
        const { verified: verifiedAccess } = await this.oAuthManager[type]?.verifyAccessToken(accessToken);
        if (verified && verifiedAccess) {
            return { verified: true, payload };
        }
        return { verified: false };
    }

    async login({ type, payload, idToken, accessToken }: TOauthTokenPayload, requestInfo: TRequestInfo) {
        const { loginId, name, passwd } = payload;
        try {
            if (await this.userService.isExist({ loginId })) {
                const userInfo = (await this.userService.get({ loginId })) as User;
                if (isErrorType(userInfo)) return ERROR_OAUTH_FAILED;

                const { passwdEnc: enc, passwdSalt } = userInfo;
                const passwdEnc = createHash(passwd, passwdSalt);
                if (passwdEnc !== enc) return ERROR_LOGIN_ID_EXIST;

                const token = await this.createJwtToken({ loginId, loginType: type, name }, requestInfo);
                if (isErrorType(token)) return token;

                return { loginResult: true, ...token };
            }

            const { info, additionalInfo } = await this.oAuthManager[type]?.getExtraInfo({ idToken, accessToken });
            if (additionalInfo.length > 0) {
                const loginFailResult = { loginResult: false, userInfo: { ...payload, ...info, passwd: undefined } };
                for (const addInfo of additionalInfo) {
                    loginFailResult.userInfo[addInfo] = null;
                }
                return loginFailResult;
            }

            return await this.register({ type, payload }, info as PostRegisterBodyDto, requestInfo);
        } catch (e) {
            console.log(e);
            return ERROR_CREATE_TOKEN;
        }
    }

    async register(
        { type, payload }: Pick<TOauthTokenPayload, 'type' | 'payload'>,
        additionalInfo: PostRegisterBodyDto,
        requestInfo: TRequestInfo
    ) {
        try {
            const { loginId, name, passwd, picture } = payload;
            const salt = createSalt();
            const userInfo: Prisma.UserCreateManyInput = {
                userId: v4(),
                loginId,
                name,
                passwdEnc: createHash(passwd, salt),
                passwdSalt: salt,
                loginType: type,
                pictureUrl: picture,
            };
            const result = await this.userService.create(userInfo);
            if (result === false) {
                this.logger.error(`이미 존재하는 사용자 입니다. (사용자 로그인 ID: ${loginId})`, {
                    loginId,
                    name,
                    loginType: type,
                });
                return ERROR_CREATE_USER;
            }

            const token = await this.createJwtToken({ loginId, loginType: type, name }, requestInfo);
            if (isErrorType(token)) return token;
            return { loginResult: true, ...token };
        } catch (e) {
            console.log(e);
            return ERROR_CREATE_USER;
        }
    }
}
