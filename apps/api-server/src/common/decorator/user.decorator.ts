import { InjectUserInterceptor } from '@module/common/interceptor/inject-user.interceptor';
import { StripRequestContextPipe } from '@module/common/pipe/request.pipe';
import { UseInterceptors, UsePipes, applyDecorators } from '@nestjs/common';
import { ValidationOptions, registerDecorator } from 'class-validator';
import { UserIdValidator } from '../validator/user.validator';

export function InjectTokenToBody() {
    return applyDecorators(InjectTokenTo('body'));
}

export function InjectTokenToQuery() {
    return applyDecorators(InjectTokenTo('query'));
}

export function InjectTokenTo(context: 'query' | 'body' | 'params') {
    return applyDecorators(UseInterceptors(new InjectUserInterceptor(context)), UsePipes(StripRequestContextPipe));
}

export function SocketInjectToken() {
    return applyDecorators(UseInterceptors(new InjectUserInterceptor()), UsePipes(StripRequestContextPipe));
}

export function IsValidPost(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'IsValidUser',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: UserIdValidator,
        });
    };
}
