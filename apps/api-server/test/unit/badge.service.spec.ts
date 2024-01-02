import { Test, TestingModule } from '@nestjs/testing';
import { BadgeService } from '../../src/router/user/badge/badge.service';

describe('BadgeService', () => {
    let service: BadgeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BadgeService],
        }).compile();

        service = module.get<BadgeService>(BadgeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
