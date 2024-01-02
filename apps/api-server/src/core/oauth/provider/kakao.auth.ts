/* eslint-disable camelcase */
import { OauthService } from '../oauth.service';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    TKakaoPublicKeyInfo,
    TOauthCallbackParam,
    TOauthExtraProfile,
    TOauthTokenInfo,
    TTokenVerifyResult,
} from '@module/type/oauth.type';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import querystring from 'querystring';
import { createPublicKey } from 'crypto';

@Injectable()
export class KakaoOauthService extends OauthService implements OnApplicationBootstrap {
    private publicKeyList: TKakaoPublicKeyInfo[] = [];
    private readonly iss = 'https://kauth.kakao.com';
    private readonly requestUrlInfo: Record<string, string> = {
        authCode: 'https://kauth.kakao.com/oauth/authorize',
        tokenFromCode: 'https://kauth.kakao.com/oauth/token',
        tokenInfo: 'https://kapi.kakao.com/v1/user/access_token_info',
        userInfo: 'https://kapi.kakao.com/v2/user/me',
        pubKey: 'https://kauth.kakao.com/.well-known/jwks.json',
    };

    private readonly headers: AxiosRequestConfig['headers'] = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    };

    constructor(private readonly httpService: HttpService, private readonly config: ConfigService) {
        super();

        this.oauthInfo = {
            responseType: 'code',
            grantType: 'authorization_code',
            clientId: [this.config.get('KAKAO_CLIENT_ID_WEB'), this.config.get('KAKAO_CLIENT_ID_IOS')],
            clientSecret: this.config.get('KAKAO_CLIENT_SECRET'),
            redirectUri: `${this.config.get('REDIRECT_URL')}?type=kakao`,
            scope: '',
            code: '',
            adminKey: this.config.get('KAKAO_ADMIN_KEY'),
        };
    }

    public getAuthUrl() {
        const {
            responseType: response_type,
            clientId,
            redirectUri: redirect_uri,
            grantType: grant_type,
        } = this.oauthInfo;
        const qs = querystring.encode({ client_id: clientId[0], redirect_uri, grant_type, response_type });
        const url = `${this.requestUrlInfo.authCode}?${qs}`;
        return url;
    }

    public async getOauthInfo(token?: TOauthTokenInfo): Promise<any> {
        try {
            if (token === undefined) return undefined;
            const { idToken } = token;
            const { verified, payload } = await this.verifyIdToken(idToken);
            if (verified === false) return undefined;
            return payload;
        } catch (e) {
            console.log(e);
            return undefined;
        }
    }

    public async getExtraInfo(tokens: TOauthTokenInfo): Promise<TOauthExtraProfile> {
        const { accessToken } = tokens;
        const extraProfile: TOauthExtraProfile = { info: {}, additionalInfo: [] };
        return extraProfile;
    }

    public async getTokenFromCode({ code }: TOauthCallbackParam): Promise<TOauthTokenInfo> {
        return { idToken: '', accessToken: '' };
    }

    public async verifyAccessToken(accessToken: string): Promise<TTokenVerifyResult> {
        return { verified: true };
    }

    public async verifyIdToken(idToken: string): Promise<TTokenVerifyResult> {
        try {
            const payload = { email: '', name: '', sub: '', picture: '' };
            const { email, name, sub, picture } = payload ?? {};
            return { verified: true, payload: { loginId: email, name, passwd: sub, picture } };
        } catch (e) {
            console.log(e);
            return { verified: false };
        }
    }

    onApplicationBootstrap() {
        this.updateOIDC();
    }

    updateOIDC() {
        //schedular
    }

    createPubKey(pubKeyInfo: TKakaoPublicKeyInfo) {
        const { n, e, kty } = pubKeyInfo;
        return createPublicKey({
            key: { n, e, kty },
            format: 'jwk',
        });
    }
}
