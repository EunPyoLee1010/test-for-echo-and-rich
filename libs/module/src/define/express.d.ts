import { TOauthTokenPayload } from '@module/type/oauth.type';
import { TTokenPayload } from '@module/type/token.type';

export {};

declare global {
    namespace Express {
        interface Request {
            requestInfo: {
                uuid?: string;
                reqStartTime?: number;
            };
            token: TTokenPayload;
            oauthToken: TOauthTokenPayload;
        }
    }
}
