/* eslint-disable camelcase */
import { ConfigService } from '@nestjs/config';
import { OauthService } from '../oauth.service';
import querystring from 'querystring';
import { generateRandomString } from '@module/module/random';
import {
    TNaverExtraInfo,
    TNaverUserInfo,
    TOauthCallbackParam,
    TOauthExtraProfile,
    TOauthTokenInfo,
    TOauthUserProfile,
    TTokenVerifyResult,
} from '@module/type/oauth.type';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { CacheService } from '@repository/cache/cache.service';

@Injectable()
export class NaverOauthService extends OauthService {
    private readonly requestUrlInfo: Record<string, string> = {
        authCode: 'https://nid.naver.com/oauth2.0/authorize',
        tokenFromCode: 'https://nid.naver.com/oauth2.0/token',
        userInfo: 'https://openapi.naver.com/v1/nid/me',
    };

    constructor(
        private readonly cache: CacheService,
        private readonly httpService: HttpService,
        private readonly config: ConfigService
    ) {
        super();

        this.oauthInfo = {
            responseType: 'code',
            grantType: 'authorization_code',
            clientId: this.config.get('NAVER_CLIENT_ID'),
            clientSecret: this.config.get('NAVER_CLIENT_SECRET'),
            redirectUri: `${this.config.get('REDIRECT_URL')}?type=naver`,
            code: '',
            scope: '',
        };
    }

    public getAuthUrl(): string {
        const { responseType: response_type, clientId: client_id, redirectUri: redirect_uri } = this.oauthInfo;
        const state = generateRandomString(6);
        const qs = querystring.encode({ client_id, redirect_uri, state, response_type });
        const url = `${this.requestUrlInfo.authCode}?${qs}`;
        return url;
    }

    public async getTokenFromCode({ code, state }: TOauthCallbackParam): Promise<TOauthTokenInfo> {
        return { idToken: '', accessToken: '' };
    }

    public async getExtraInfo(token: TOauthTokenInfo): Promise<TOauthExtraProfile> {
        const extraProfile: TOauthExtraProfile = { info: {}, additionalInfo: [] };
        return extraProfile;
    }

    public async getOauthInfo(token: TOauthTokenInfo): Promise<TOauthUserProfile> {
        if (token === undefined) return undefined;
        const { accessToken } = token;
        const { verified, payload } = await this.verifyAccessToken(accessToken);
        if (verified === false) return undefined;
        return payload;
    }

    public async verifyAccessToken(accessToken: string): Promise<TTokenVerifyResult> {
        const payload = { email: '', id: '', name: '', profile_image: '' };
        const { email: loginId, id: passwd, name, profile_image: picture } = payload ?? {};
        return { verified: true, payload: { loginId, name, passwd, picture } };
    }

    public async verifyIdToken(idToken: string): Promise<TTokenVerifyResult> {
        return await this.verifyAccessToken(idToken);
    }

    private async saveExtraInfo(userInfo: TNaverUserInfo['response']) {
        const { email, gender, birthday, birthyear, mobile } = userInfo;
        const extraInfo: TNaverExtraInfo = { gender, birthday, birthyear, mobile };
        const extraInfoRedisKey = this.cache.getExtraInfoRedisKey('naver', email);
        await this.cache.hmset(extraInfoRedisKey, extraInfo);
    }
}
