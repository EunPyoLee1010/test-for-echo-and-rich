import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@api-server/router/auth/auth.service';
import { ERROR_INVALID_OAUTH_TOKEN } from '@module/constant/error.constant';
import { OauthProviderList } from '@module/type/oauth.type';
import { Request } from 'express';

@Injectable()
export class OauthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const req = context.switchToHttp().getRequest<Request>();
            const {
                'id-token': cookieIdToken,
                'access-token': cookieAccessToken,
                'oauth-type': cookieType,
            } = req.cookies ?? {};
            const {
                'id-token': headerIdToken,
                'access-token': headerAccessToken,
                'oauth-type': headerType,
            } = req.headers ?? {};
            const idToken = (cookieIdToken ?? headerIdToken)?.replace('Bearer ', '');
            const accessToken = (cookieAccessToken ?? headerAccessToken)?.replace('Bearer ', '');
            const type = cookieType ?? headerType;

            if (idToken === undefined || accessToken === undefined || !OauthProviderList.includes(type)) {
                return false;
            }

            const { verified, payload } = await this.authService.verify(type, { idToken, accessToken });
            if (verified === false) return false;
            req.oauthToken = { type, payload, idToken, accessToken };
            return true;
        } catch (e) {
            console.log(e);
            throw new UnauthorizedException(ERROR_INVALID_OAUTH_TOKEN);
        }
    }
}
