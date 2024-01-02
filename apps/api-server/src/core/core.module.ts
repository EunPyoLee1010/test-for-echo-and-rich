import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CoreDynamicModule } from '@module/common/dynamic.service';
import { RepositoryModule } from '@repository/main';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@repository/cache/cache.module';
import { ValidatorModule } from '@api-server/common/validator/validator.module';
import { LogModule } from '@module/module/log/log.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        LogModule,
        ValidatorModule,
        CacheModule,
        CoreDynamicModule.create().configModule(),
        RepositoryModule,
        { ...HttpModule.register({}), global: true },
        ThrottlerModule.forRoot({ ttl: 60, limit: 1000 }),
        ScheduleModule.forRoot(),
    ],
    providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
    exports: [HttpModule, ScheduleModule],
})
export class CoreModule {}
