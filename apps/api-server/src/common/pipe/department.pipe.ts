/* eslint-disable camelcase */
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class DepartmentParseIntPipe<T extends { department_id: string | number }> implements PipeTransform {
    transform(value: T, metadata: ArgumentMetadata) {
        const { department_id } = value;
        if (typeof department_id === 'string') value.department_id = +value.department_id;
        if (Number.isNaN(value.department_id)) throw new BadRequestException();
        return value;
    }
}
