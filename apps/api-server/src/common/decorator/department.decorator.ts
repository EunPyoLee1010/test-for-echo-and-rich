import { ValidationOptions, registerDecorator } from 'class-validator';
import { DepartmentIdValidator } from '../validator/department.decorator';

export function IsValidDepartment(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'IsValidDepartment',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: DepartmentIdValidator,
        });
    };
}
