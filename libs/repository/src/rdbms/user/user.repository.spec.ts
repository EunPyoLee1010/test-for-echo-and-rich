/* eslint-disable camelcase */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import { UserRepository } from './user.repository';
import { LogService } from '@module/module/log/log.service';

export class TestConfigService extends ConfigService {
    constructor() {
        super({
            envFilePath: path.resolve(process.env.PWD ?? '', '../../.test.env'),
            isGlobal: true,
        });
    }
}

describe('UserRepository', () => {
    let service: UserRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ConfigService,
                    useClass: TestConfigService,
                },
                {
                    provide: LogService,
                    useClass: LogService,
                },
                UserRepository,
            ],
        }).compile();

        service = module.get<UserRepository>(UserRepository);
    });

    it('선언 여부', () => {
        expect(service).toBeDefined();
    });

    it('User 전체 조회', async () => {
        const findAllResult = await service.get();
        expect(findAllResult.length).toBe(3);
    });

    it('User 한명 조회', async () => {
        //database 모킹 시, 인자를 읽지 않아서 where에 아무리 써도 그냥 처음 모킹한 배열 그대로 반환하는 문제 있음 수정 요망
        const [findResult] = await service.get({
            where: { login_id: 'dldmsvy1010@naver.com', name: 'eunpyo' },
        });
        expect(findResult.name).toBe('eunpyo');
    });

    it('User 조회 실패', async () => {
        const [findResult] = await service.get({ where: { login_id: 'dldmsvy1010@yahoo.com' } });
        expect(findResult).toBe(undefined);
    });
});
