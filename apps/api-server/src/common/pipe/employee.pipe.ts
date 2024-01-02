/* eslint-disable camelcase */
import { GetEmployeeQueryDto } from '@api-server/type/dto/employee.dto';
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class EmployParseIntPipe implements PipeTransform {
    transform(value: GetEmployeeQueryDto, metadata: ArgumentMetadata) {
        const { employee_id } = value;
        if (typeof employee_id === 'string') value.employee_id = +value.employee_id;
        if (Number.isNaN(value.employee_id)) throw new BadRequestException();
        return value;
    }
}
