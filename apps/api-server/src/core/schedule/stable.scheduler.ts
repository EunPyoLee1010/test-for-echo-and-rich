import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SYSTEM_TOKEN } from '@module/constant/log.constant';
import { LogService } from '@module/module/log/log.service';
import { stableSetInterval } from '@module/module/time';
import nodeGeocoder, { Geocoder } from 'node-geocoder';

export class StableScheduler {
    private readonly geocoder: Geocoder;
    constructor(private readonly logger: LogService, private readonly config: ConfigService) {
        this.geocoder = nodeGeocoder({ provider: 'openstreetmap' });
    }

    static create(logger: LogService, app: INestApplication) {
        const config = app.get(ConfigService);
        return new StableScheduler(logger, config);
    }

    schedule() {
        this.logger.log(`Scheduler가 실행됐습니다.`, SYSTEM_TOKEN);
        const intervalTime = this.config.get('STABLE_SCHEDULER_TIME');
        stableSetInterval(async () => {}, intervalTime);
    }
}
