import { Global, Module } from '@nestjs/common';

const validatorList = [];

@Global()
@Module({
    providers: validatorList,
    exports: validatorList,
})
export class ValidatorModule {}
