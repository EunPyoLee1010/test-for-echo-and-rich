import { ValidationOptions, registerDecorator } from 'class-validator';
import { EmployeetIdValidator } from '../validator/employee.decorator';

export function IsValidEmployee(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'IsValidEmployee',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: EmployeetIdValidator,
        });
    };
}
