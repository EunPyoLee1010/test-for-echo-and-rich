import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from '@api-server/router/user/user.service';
import { Request } from 'express';
import { isErrorType } from '@module/module/error';

@Injectable()
export class RegisterGuard implements CanActivate {
    constructor(private readonly userService: UserService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const req = context.switchToHttp().getRequest<Request>();
            const loginId = req.oauthToken?.payload?.loginId;
            const phoneNumber = req.body.phoneNumber;
            if (loginId === undefined || phoneNumber === undefined) {
                return false;
            }
            const isExist = await this.userService.isExist({ loginId });
            if (isErrorType(isExist)) return false;
            return isExist;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}
