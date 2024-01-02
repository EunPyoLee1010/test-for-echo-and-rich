import {
    CallHandler,
    ExecutionContext,
    InternalServerErrorException,
    NestInterceptor,
    UseInterceptors,
} from '@nestjs/common';
import { ERROR_SYSTEM_LOGIC, ERROR_TYPE } from '@module/constant/error.constant';
import { isErrorType } from '@module/module/error';
import { TTransformResponse } from '@module/type/response.type';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function Transform<T>(responseDTO: ClassConstructor<T>) {
    return UseInterceptors(new TransformInterceptor(responseDTO));
}

export class TransformInterceptor<T> implements NestInterceptor {
    constructor(private readonly dto: ClassConstructor<T>) {}
    intercept(
        ctx: ExecutionContext,
        next: CallHandler
    ):
        | Observable<TTransformResponse<T | Readonly<ERROR_TYPE>>>
        | Promise<Observable<TTransformResponse<T | Readonly<ERROR_TYPE>>>> {
        try {
            const { getRequest, getResponse } = ctx.switchToHttp();
            const req = getRequest<Request>();
            const res = getResponse<Response>();
            return next.handle().pipe(
                map((data) => ({
                    statusCode: res.statusCode,
                    path: req.path,
                    timestamp: new Date().toISOString(),
                    response: isErrorType(data)
                        ? data
                        : plainToInstance(this.dto, data, { excludeExtraneousValues: true }),
                }))
            );
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(ERROR_SYSTEM_LOGIC);
        }
    }
}
