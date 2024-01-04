import { Global, Module } from '@nestjs/common';
import { EmployeetIdValidator } from './employee.decorator';
import { DepartmentIdValidator } from './department.decorator';

const validatorList = [EmployeetIdValidator, DepartmentIdValidator];

@Global()
@Module({
    providers: validatorList,
    exports: validatorList,
})
export class ValidatorModule {}
