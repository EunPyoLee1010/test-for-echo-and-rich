/* eslint-disable camelcase */
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class EmployParseIntPipe<T extends { employee_id: string | number }> implements PipeTransform {
    transform(value: T, metadata: ArgumentMetadata) {
        const { employee_id } = value;
        if (typeof employee_id === 'string') value.employee_id = +value.employee_id;
        if (Number.isNaN(value.employee_id)) throw new BadRequestException();
        return value;
    }
}
