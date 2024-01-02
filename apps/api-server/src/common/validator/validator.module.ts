import { Global, Module } from '@nestjs/common';
import { UserIdValidator } from './user.validator';

const validatorList = [UserIdValidator];

@Global()
@Module({
    providers: validatorList,
    exports: validatorList,
})
export class ValidatorModule {}
