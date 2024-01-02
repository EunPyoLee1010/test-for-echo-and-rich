import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import moment from 'moment';

@ValidatorConstraint()
export class DateFormatValidator implements ValidatorConstraintInterface {
    validate(value: any) {
        try {
            return (
                /^[1-9]\d*-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value) && moment(value, 'YYYY-MM-DD').isValid()
            );
        } catch (e) {
            return false;
        }
    }

    defaultMessage({ property }) {
        return `${property} must be a valid date (Required format: YYYY-MM-DD)`;
    }
}
