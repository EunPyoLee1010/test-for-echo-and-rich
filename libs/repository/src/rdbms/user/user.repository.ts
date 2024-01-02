/* eslint-disable camelcase */
import { Injectable } from '@nestjs/common';
import { RDBMSConnectionManager } from '../manager';
import { Prisma } from '@prisma/client';
import { ERROR_DATABASE_USER_SELECT, ERROR_UNIQUE_USER_INFO_NOT_FOUND } from '@module/constant/error.constant';

@Injectable()
export class UserRepository {
    private readonly userRepo: Prisma.UserDelegate;
    constructor(private readonly rdbms: RDBMSConnectionManager) {
        this.userRepo = this.rdbms.client.user;
    }

    async isExist({ loginId, userId }: { loginId?: string; userId?: string }) {
        try {
            if (!loginId && !userId) return ERROR_UNIQUE_USER_INFO_NOT_FOUND;
            const existedUserList = await this.get({
                select: { userId: true, loginId: true },
                where: { loginId, deletedAt: null, OR: [{ userId, deletedAt: null }] },
            });
            return existedUserList.length > 0;
        } catch (e) {
            console.log(e);
            return ERROR_DATABASE_USER_SELECT;
        }
    }

    async get(args?: Prisma.UserFindManyArgs) {
        return this.userRepo.findMany(args);
    }

    async create(args: Prisma.UserCreateManyArgs) {
        const { data } = args;
        const result = await this.userRepo.createMany(args).then((v) => v.count);
        const count = Array.isArray(data) ? data.length : 1;
        return result === count;
    }

    async update(args: Prisma.UserUpdateManyArgs) {
        const { data } = args;
        const result = await this.userRepo.updateMany(args).then((v) => v.count);
        const count = Array.isArray(data) ? data.length : 1;
        return result === count;
    }

    async delete({ loginId, userId }: { loginId?: string; userId?: string }) {
        if (!loginId && !userId) return ERROR_UNIQUE_USER_INFO_NOT_FOUND;
        const deleteResult = await this.update({
            data: { deletedAt: new Date() },
            where: { loginId, userId, deletedAt: null },
        });
        return deleteResult;
    }
}
