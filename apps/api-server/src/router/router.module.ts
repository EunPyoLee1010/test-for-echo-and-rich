import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { LoggingMiddleware } from '@module/common/middleware/logging.middleware';
import { EmployeeModule } from './employee/employee.module';

@Module({
    imports: [EmployeeModule],
})
export class RouterModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggingMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
