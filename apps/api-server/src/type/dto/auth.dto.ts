import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsPhoneNumber, IsString, Validate } from 'class-validator';
import { ExtraProfileList, GenderList, OauthProviderList, TGender, TOauthProvider } from '@module/type/oauth.type';
import { DateFormatValidator } from '@module/common/validator/date.validator';

export class PostRegisterBodyDto {
    @IsEnum(GenderList)
    @ApiProperty({ type: String, required: true, description: '성별 정보(ex: "M", "U")', example: 'M' })
    gender: TGender;

    @IsPhoneNumber('KR')
    @ApiProperty({ type: String, required: true, description: '전화 번호', example: '010-2675-3706' })
    phoneNumber: string;

    @Validate(DateFormatValidator)
    @ApiProperty({ type: String, required: true, description: '생년월일', example: '1996-10-10' })
    birthday: string;
}

export class UserProfileDto extends PartialType(PostRegisterBodyDto) {
    @Expose()
    @ApiProperty({ type: String, required: true, description: '로그인 이메일 정보', example: 'test@example.com' })
    loginId: string;

    @Expose()
    @ApiProperty({ type: String, required: true, description: '사용자 프로필 정보', example: 'www.picture.com' })
    picture: string;

    @Expose()
    @ApiProperty({ type: String, required: true, description: '사용자 이름', example: 'test' })
    name: string;
}

export class GetAuthCallbackResponse {
    @Expose()
    @ApiProperty({ type: Boolean, description: '로그인 성공 여부', example: true })
    loginResult: boolean;

    @Expose()
    @ApiProperty({ type: Boolean, description: '로그인하기 위해 필요한 정보들', example: ExtraProfileList })
    userInfo?: UserProfileDto;

    @Expose()
    @ApiProperty({ type: String, description: '사용자 인증이 담긴 JWT Token', example: 'eyJhbGci...' })
    token?: string;

    @Expose()
    @ApiProperty({ type: String, required: false, description: 'Token 만료 시각', example: new Date() })
    expiredAt?: string;

    @Exclude()
    @ApiProperty({ type: String, description: 'Token 만료 시간', example: '1h' })
    expiresIn?: string;
}

export class GetAuthCallbackDTO {
    @IsString()
    code: string;

    @IsEnum(OauthProviderList)
    type: TOauthProvider;

    @IsOptional()
    @IsString()
    state?: string;
}

export class GetAuthTestDto extends PickType(GetAuthCallbackDTO, ['type']) {}
