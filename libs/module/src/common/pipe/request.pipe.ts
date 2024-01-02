import { Injectable, PipeTransform } from '@nestjs/common';
import { REQUEST_TOKEN_CONTEXT } from '@module/common/interceptor/inject-user.interceptor';
import { omit } from 'lodash';

@Injectable()
export class StripRequestContextPipe implements PipeTransform {
    transform(value: any) {
        return value[REQUEST_TOKEN_CONTEXT] ? omit(value, REQUEST_TOKEN_CONTEXT) : value;
    }
}
