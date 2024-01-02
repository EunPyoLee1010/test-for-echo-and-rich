/* eslint-disable camelcase */
import { BadRequestException, Injectable } from '@nestjs/common';
import { REQUEST_TOKEN_CONTEXT } from '@module/common/interceptor/inject-user.interceptor';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { UserRepository } from '@repository/rdbms/user/user.repository';
import { isErrorType } from '@module/module/error';
import { ERROR_DATABASE_USER_SELECT } from '@module/constant/error.constant';

@ValidatorConstraint()
@Injectable()
export class UserIdValidator implements ValidatorConstraintInterface {
    constructor(private readonly userRepo: UserRepository) {}
    async validate(_: string, args?: ValidationArguments) {
        try {
            const userId = args.object?.[REQUEST_TOKEN_CONTEXT]?.userId;
            const isExist = await this.userRepo.isExist({ userId });
            return isErrorType(isExist) ? false : isExist;
        } catch (e) {
            console.log(e);
            throw new BadRequestException(ERROR_DATABASE_USER_SELECT);
        }
    }

    defaultMessage(): string {
        return '존재하지 않는 사용자 입니다.';
    }
}
