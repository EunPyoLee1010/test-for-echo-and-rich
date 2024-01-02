import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtPayload, verify } from 'jsonwebtoken';
import { encryptJwtSecretKey } from '@module/module/encryption';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { TSocketInfo, TTokenPayload } from '@module/type/token.type';
import { UserRepository } from '@repository/rdbms/user/user.repository';
import { ERROR_LOGIN_ID_NOT_FOUND, ERROR_USER_NOT_FOUND } from '@module/constant/error.constant';
import { getIpAddress } from '@module/module/etc';
import { CacheService } from '@repository/cache/cache.service';
import moment from 'moment';
import { User } from '@prisma/client';

@Injectable()
export class JwtGuard implements CanActivate {
    private readonly jwtSecret: string;

    constructor(
        private readonly config: ConfigService,
        private readonly userRepo: UserRepository,
        private readonly cache: CacheService
    ) {
        this.jwtSecret = this.config.get('JWT_SECRET');
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
        const client = context.switchToWs().getClient<TSocketInfo>();

        const verifyResult = await (async () => {
            if (req) return await this.verifyHttp(req);
            if (client) return await this.verifySocket(client);
            return false;
        })();

        return verifyResult;
    }

    public async verifyHttp(req: Request) {
        try {
            const authorization = req.headers.authorization?.replace('Bearer ', '') ?? '';
            const token = verify(authorization, encryptJwtSecretKey({ req }, this.jwtSecret)) as TTokenPayload &
                JwtPayload;
            const [{ userId }] = (await this.userRepo.get({
                where: { loginId: req.token.loginId, deletedAt: null },
            })) ?? [{}];

            if (!userId) throw new UnauthorizedException(ERROR_LOGIN_ID_NOT_FOUND);

            req.token = { ...(token as TTokenPayload), userId };
            return true;
        } catch (e) {
            console.log(e);
            throw new UnauthorizedException(ERROR_USER_NOT_FOUND);
        }
    }

    public async verifySocket(client: TSocketInfo) {
        try {
            const authorization = client.handshake.auth.authorization || client.handshake.headers['authorization'];
            if (!authorization) throw new ForbiddenException();

            const ipAddress = getIpAddress(client.handshake.address);
            const token = authorization.replace('Bearer ', '');

            const payload = verify(token, encryptJwtSecretKey({ ipAddress }, this.jwtSecret)) as TTokenPayload &
                JwtPayload;
            const [userInfo] = await this.userRepo.get({
                where: { loginId: payload.loginId ?? '', deletedAt: null },
            });

            if (userInfo === undefined) throw new UnauthorizedException(ERROR_LOGIN_ID_NOT_FOUND);
            client.token = { ...payload, userId: userInfo.userId };

            await this.updateLastAccessedTime(userInfo);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    private async updateLastAccessedTime(userInfo: User) {
        const userId = userInfo.userId;
        const accessedAt = new Date();
        const lastAccessedAtRedisKey = this.cache.getLastAccessedAtRedisKey(userId);
        const lastAccessedAt = new Date((await this.cache.get(lastAccessedAtRedisKey)) || new Date());
        if (!userInfo.lastAccessedAt || moment(accessedAt).diff(moment(lastAccessedAt)) > 10 * 60 * 1000) {
            const updateResult = await this.userRepo.update({
                data: { lastAccessedAt: accessedAt },
                where: { userId },
            });

            if (!updateResult) throw new InternalServerErrorException();
        }

        await this.cache.set(lastAccessedAtRedisKey, accessedAt);
    }
}
