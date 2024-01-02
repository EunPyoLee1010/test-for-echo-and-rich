import {
    TOauthCallbackParam,
    TOauthExtraProfile,
    TOauthInfo,
    TOauthTokenInfo,
    TOauthUserProfile,
    TTokenVerifyResult,
} from '@module/type/oauth.type';

export abstract class OauthService {
    protected oauthInfo: TOauthInfo;

    constructor() {}
    abstract getAuthUrl(): string;
    abstract getOauthInfo(token: TOauthTokenInfo): Promise<TOauthUserProfile>;
    abstract getExtraInfo(token: TOauthTokenInfo): Promise<TOauthExtraProfile>;
    abstract getTokenFromCode({ code, state }: TOauthCallbackParam): Promise<TOauthTokenInfo>;
    abstract verifyIdToken(idToken: string): Promise<TTokenVerifyResult>;
    abstract verifyAccessToken(accessToken: string): Promise<TTokenVerifyResult>;
}
