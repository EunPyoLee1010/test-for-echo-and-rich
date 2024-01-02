import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { LoggingMiddleware } from '@module/common/middleware/logging.middleware';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SocketModule } from './socket/socket.module';

@Module({
    imports: [UserModule, AuthModule, SocketModule],
})
export class RouterModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggingMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
