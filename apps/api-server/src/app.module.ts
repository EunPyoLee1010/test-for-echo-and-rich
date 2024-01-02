import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { RouterModule } from './router/router.module';

@Module({
    imports: [CoreModule, RouterModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
