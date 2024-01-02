import { Global, Module } from '@nestjs/common';
import { CoreDynamicModule } from '@module/common/dynamic.service';
import { CacheService } from './cache.service';

@Global()
@Module({
    imports: [CoreDynamicModule.create().redisModule()],
    providers: [CacheService],
    exports: [CacheService],
})
export class CacheModule {}
