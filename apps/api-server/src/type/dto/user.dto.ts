import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const genderTuple = ['M', 'W', 'U'] as const;
type genderType = (typeof genderTuple)[number];

export class GetUserResponse {
    @Exclude()
    userId: string;

    @Expose()
    @ApiProperty({ type: 'email', description: '로그인 ID', example: 'example@gmail.com' })
    loginId: string;

    @Expose()
    @ApiProperty({ type: String, description: '성명', example: '홍 길동' })
    name: string;

    @Expose()
    @ApiProperty({ type: String, description: '성별(남성: M, 여성: W, 미지정: U)', example: 'M' })
    gender: genderType;

    @Expose()
    @ApiProperty({ type: Number, description: '레벨', example: 1 })
    level: number;

    @Expose()
    @ApiProperty({ type: Number, description: '경험치', example: 0 })
    experience: number;

    @Expose()
    @ApiProperty({ type: Number, description: '프로필 이미지 url', example: 'https://www.example.com/picture/1' })
    pictureUrl: string;
}

export class DeleteUserResponse {
    @Expose()
    userId: string;

    @Expose()
    deletedAt: Date;
}
