import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsNumberString } from 'class-validator';

export const customRequestParamTuple = ['posts', 'comments'] as const;
export type TCustomRequestParam = (typeof customRequestParamTuple)[number];

export class GetCustomParamDto {
    @IsEnum(customRequestParamTuple, {
        message: `가능한 field Option은 다음과 같습니다. ${customRequestParamTuple.toString()}`,
    })
    @ApiProperty({
        type: 'enum',
        description: '요청할 커스텀 필드',
        enum: customRequestParamTuple,
        example: customRequestParamTuple[0],
    })
    field: TCustomRequestParam;

    @IsNumberString()
    @ApiProperty({ type: String, description: '커스텀 필드에서 가져올 데이터 ID', example: '1' })
    id: string;
}

export class GetCustomPostResponse {
    @Expose()
    @ApiProperty({ type: Number, description: '사용자 ID', example: 1 })
    userId: number;

    @Expose()
    @ApiProperty({ type: Number, description: 'post ID', example: 1 })
    id: number;

    @Expose()
    @ApiProperty({ type: String, description: 'post 제목', example: 'title' })
    title: string;

    @Expose()
    @ApiProperty({ type: String, description: 'post 내용', example: 'description' })
    body: string;
}

export class GetCustomCommentResponse {
    @Expose()
    @ApiProperty({ type: Number, description: 'post ID', example: 1 })
    postId: number;

    @Expose()
    @ApiProperty({ type: Number, description: 'Comment ID', example: 1 })
    id: number;

    @Expose()
    @ApiProperty({ type: String, description: 'Comment 제목', example: 'title' })
    name: string;

    @Expose()
    @ApiProperty({ type: String, description: 'Comment 작성자 이메일', example: 'Eliseo@gardner.biz' })
    email: string;

    @Expose()
    @ApiProperty({ type: String, description: 'Comment 내용', example: 'description' })
    body: string;
}
