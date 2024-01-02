import { Test, TestingModule } from '@nestjs/testing';
import { CoreModule } from '../../src/core/core.module';
import { UserService } from '../../src/router/user/user.service';
import { RepositoryModule } from '@repository/main';
import { UserRepository } from '@repository/rdbms/user/user.repository';
import { isErrorType } from '@module/module/error';
import { ERROR_TYPE } from '@module/constant/error.constant';
import { v4 } from 'uuid';
import { User } from '@prisma/client';

const testMockUserList = [
    {
        id: v4(),
        loginId: 'dldmsvy1010@naver.com',
        type: 'google',
        name: 'eunpyo',
        gender: 'M',
        level: 1,
        experience: 0,
    },
    {
        id: v4(),
        loginId: 'dldmsvy1010@gmail.com',
        type: 'google',
        name: 'eunpyo',
        gender: 'M',
        level: 1,
        experience: 0,
    },
    {
        id: v4(),
        loginId: 'dldmsvy1010@keti.re.kr',
        type: 'google',
        name: 'eunpyo',
        gender: 'M',
        level: 1,
        experience: 0,
    },
];

describe('UserService', () => {
    let service: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CoreModule, RepositoryModule],
            providers: [
                UserService,
                {
                    provide: UserRepository,
                    useValue: {
                        get: jest.fn(({ where: { loginId: email } }) =>
                            testMockUserList
                                .filter((v) => v.loginId === email || email === undefined)
                                .map((v) => ({ loginId: v.loginId, id: v.id }))
                        ),
                        create: jest.fn().mockResolvedValue([1, 1]),
                        update: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it('선언 여부', () => {
        expect(service).toBeDefined();
    });

    it('중복 사용자 없음', async () => {
        const isExist = await service.isExist('dldmsvy1010@nexon.com');
        expect(isExist).toBe(false);
    });

    it('중복 사용자 존재', async () => {
        const isExist = await service.isExist('dldmsvy1010@naver.com');
        expect(isExist).toBe(true);
    });

    it('사용자 본인 정보 조회', async () => {
        (service as any).userRepo.get = jest.fn(({ where: { loginId } }) =>
            testMockUserList.filter((v) => v.loginId === loginId || loginId === undefined)
        );

        const loginId = 'dldmsvy1010@naver.com';
        const userInfo = await service.get({ loginId });
        expect(isErrorType(userInfo)).toBe(false);
        expect((userInfo as User).loginId).toBe(loginId);
    });

    it('존재하지 않는 사용자 정보 조회', async () => {
        (service as any).userRepo.get = jest.fn(
            ({
                where: {
                    AND: [{ loginId }],
                },
            }) => testMockUserList.filter((v) => v.loginId === loginId || loginId === undefined)
        );

        const loginId = 'strange@email.com';
        const userInfo = await service.get({ loginId });

        expect(isErrorType(userInfo)).toBe(true);
        expect((userInfo as Readonly<ERROR_TYPE>).code).toBe(4004);
        expect((userInfo as Readonly<ERROR_TYPE>).message).toBe('사용자를 찾을 수 없습니다.');
    });

    it('사용자 생성', async () => {});

    it('사용자 정보 수정', async () => {});

    it('사용자 정보 삭제', async () => {});
});
