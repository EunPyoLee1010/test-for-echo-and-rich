/* eslint-disable camelcase */
import { OauthService } from '../oauth.service';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import {
    TOauthCallbackParam,
    TOauthExtraProfile,
    TOauthTokenInfo,
    TOauthUserProfile,
    TTokenVerifyResult,
} from '@module/type/oauth.type';

@Injectable()
export class GoogleOauthService extends OauthService {
    private readonly oauthClient: OAuth2Client;
    private readonly scope: string[] = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/user.gender.read',
        'https://www.googleapis.com/auth/user.birthday.read',
        'https://www.googleapis.com/auth/user.phonenumbers.read',
    ];

    constructor(private readonly config: ConfigService) {
        super();

        this.oauthInfo = {
            responseType: 'code',
            grantType: 'authorization_code',
            clientId: [this.config.get('GOOGLE_CLIENT_ID_WEB'), this.config.get('GOOGLE_CLIENT_ID_IOS')],
            clientSecret: this.config.get('GOOGLE_CLIENT_SECRET'),
            redirectUri: `${this.config.get('REDIRECT_URL')}?type=google`,
            scope: this.scope,
            code: '',
        };
        const { clientId, clientSecret, redirectUri } = this.oauthInfo;
        this.oauthClient = new google.auth.OAuth2(clientId[0], clientSecret, redirectUri);
    }

    public getAuthUrl() {
        const authUrl = this.oauthClient.generateAuthUrl({
            access_type: this.config.get('NODE_ENV') === 'production' ? undefined : 'offline',
            scope: this.oauthInfo.scope,
        });
        return authUrl;
    }

    public async getOauthInfo(tokens: TOauthTokenInfo): Promise<TOauthUserProfile> {
        try {
            if (tokens === undefined) return undefined;
            const { idToken } = tokens;
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

    private async getPeopleResource(access_token: string) {}

    public async getTokenFromCode({ code }: TOauthCallbackParam) {
        return { idToken: '', accessToken: '' };
    }

    public async verifyIdToken(idToken: string): Promise<TTokenVerifyResult> {
        try {
            const payload = { email: '', picture: '', name: '', sub: '' };
            const { email, picture, name, sub } = payload ?? {};
            return { verified: true, payload: { loginId: email, picture, name, passwd: sub } };
        } catch (e) {
            console.log(e);
            return { verified: false };
        }
    }

    public async verifyAccessToken(accessToken: string): Promise<TTokenVerifyResult> {
        return { verified: true };
    }
}
