import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { settingBootstrap } from '@module/module/setting';
import { StableScheduler } from './core/schedule/stable.scheduler';
import { useContainer } from 'class-validator';
import { LogService } from '@module/module/log/log.service';
import { SYSTEM_TOKEN } from '@module/constant/log.constant';

globalThis.serviceName = 'echo-and-rich-test';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService);
    const logger = new LogService();
    const port = config.get('API_PORT');

    settingBootstrap(app, { logger, prefix: '/api/v1' });
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    app.listen(port, '0.0.0.0').then(async () => {
        logger.log(`${serviceName} 서버가 실행됐습니다. (url: ${await app.getUrl()})`, SYSTEM_TOKEN);
    });

    StableScheduler.create(logger, app).schedule();
}

bootstrap();
