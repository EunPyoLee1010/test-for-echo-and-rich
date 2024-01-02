import { ApiProperty } from '@nestjs/swagger';
import { ERROR_TYPE, ERROR_TYPE_LIST } from '@module/constant/error.constant';

export function isErrorType(obj: any): obj is Readonly<ERROR_TYPE> {
    return ERROR_TYPE_LIST.includes(obj.type);
}

export class ErrorResponse {
    constructor(errorType: Readonly<ERROR_TYPE>) {
        return Object.assign(this, errorType);
    }
    @ApiProperty({ type: String, description: '오류 타입 정의 (비즈니스, 데이터베이스)', example: 'business' })
    type: (typeof ERROR_TYPE_LIST)[number];

    @ApiProperty({ type: Number, description: '서버에서 정의한 상태코드', example: 4000 })
    statusCode: number;

    @ApiProperty({ type: String, description: '오류 메세지', example: 'error message' })
    message: string;
}
