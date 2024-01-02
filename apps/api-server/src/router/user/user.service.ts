/* eslint-disable camelcase */
import { Injectable } from '@nestjs/common';
import { UserRepository } from '@repository/rdbms/user/user.repository';
import { Prisma } from '@prisma/client';
import {
    ERROR_DATABASE_USER_DELETE,
    ERROR_DATABASE_USER_SELECT,
    ERROR_USER_NOT_FOUND,
} from '@module/constant/error.constant';
import { TTokenPayload } from '@module/type/token.type';

@Injectable()
export class UserService {
    constructor(private readonly userRepo: UserRepository) {}

    async isExist({ loginId, userId }: { loginId?: string; userId?: string }) {
        const isExist = await this.userRepo.isExist({ loginId, userId });
        return isExist;
    }

    async get({ loginId, userId }: Partial<Pick<Prisma.UserCreateManyInput, 'loginId' | 'userId'>>) {
        try {
            const [userInfo] = await this.userRepo.get({ where: { AND: [{ userId, loginId }, { deletedAt: null }] } });
            if (userInfo === undefined) {
                return ERROR_USER_NOT_FOUND;
            }
            return userInfo;
        } catch (e) {
            console.log(e);
            return ERROR_DATABASE_USER_SELECT;
        }
    }

    async create(userInfo: Prisma.UserCreateManyInput) {
        try {
            const result = await this.userRepo.create({ data: [userInfo] });
            return result;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async delete(token: TTokenPayload) {
        try {
            const { userId } = token;
            const deletedAt = new Date();
            const deleteResult = await this.userRepo.update({ data: { deletedAt }, where: { userId } });
            if (deleteResult === false) return ERROR_DATABASE_USER_DELETE;
            return { userId, deletedAt };
        } catch (e) {
            console.log(e);
            return ERROR_DATABASE_USER_DELETE;
        }
    }
}
