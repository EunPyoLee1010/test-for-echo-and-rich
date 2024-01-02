import { Test, TestingModule } from '@nestjs/testing';
import { AreaService } from '../../src/core/chat/area.service';

describe('GeolocationService', () => {
    let service: AreaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AreaService],
        }).compile();

        service = module.get<AreaService>(AreaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
