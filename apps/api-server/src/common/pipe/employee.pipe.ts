/* eslint-disable camelcase */
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class EmployParseIntPipe<T extends { employee_id: string | number }> implements PipeTransform {
    transform(value: T, metadata: ArgumentMetadata) {
        const { employee_id } = value;
        if (employee_id === undefined) throw new BadRequestException('employee_id를 입력해야합니다.');
        if (typeof employee_id === 'string') value.employee_id = +value.employee_id;
        if (Number.isNaN(value.employee_id)) throw new BadRequestException('employee_id를 숫자로 입력해주세요.');
        return value;
    }
}
