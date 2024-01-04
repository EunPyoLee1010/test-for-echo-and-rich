import { Expose } from 'class-transformer';
import { IsEnum, IsNumberString } from 'class-validator';

export const customRequestParamTuple = ['posts', 'comments'] as const;
export type TCustomRequestParam = (typeof customRequestParamTuple)[number];

export class GetCustomParamDto {
    @IsEnum(customRequestParamTuple, {
        message: `가능한 field Option은 다음과 같습니다. ${customRequestParamTuple.toString()}`,
    })
    field: TCustomRequestParam;

    @IsNumberString()
    id: string;
}

export class GetCustomPostResponse {
    @Expose()
    userId: number;

    @Expose()
    id: number;

    @Expose()
    title: string;

    @Expose()
    body: string;
}

export class GetCustomCommentResponse {
    @Expose()
    postId: number;

    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    email: string;

    @Expose()
    body: string;
}
