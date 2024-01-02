export const GenderList = ['M', 'W'] as const;
export type TGender = (typeof GenderList)[number];

export const ExtraProfileList = ['birthday', 'gender', 'phoneNumber'] as const;
export type TExtraProfileType = (typeof ExtraProfileList)[number];

export const OauthProviderList = ['kakao', 'google', 'naver'] as const;
export type TOauthProvider = (typeof OauthProviderList)[number];

export type TUserProfile = TOauthUserProfile & { gender?: string; phoneNumber?: string };

export type TOauthCallbackParam = {
    code: string;
    state?: string;
};

export type TOauthUserProfile = {
    loginId: string;
    name: string;
    passwd: string;
    picture: string;
};

export type TOauthExtraProfile = {
    info: {
        gender?: TGender;
        birthday?: string;
        phoneNumber?: string;
    };
    additionalInfo: TExtraProfileType[];
};

export type TOauthInfo = {
    responseType: 'code';
    grantType: 'authorization_code';
    clientId: string[];
    clientSecret: string;
    redirectUri: string;
    scope: string | string[];
    code: string;
    adminKey?: string;
};

export type TGoogleTokenInfo = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
    token_type: 'Bearer';
    id_token: string;
};

export type TTokenVerifyResult = {
    verified: boolean;
    payload?: TOauthUserProfile;
};

export type TOauthTokenPayload = {
    type: TOauthProvider;
    idToken: string;
    accessToken: string;
    payload?: TOauthUserProfile;
};

export type TOauthTokenInfo = {
    idToken: string;
    accessToken: string;
};

export type TKakaoPublicKeyInfo = {
    kid: string;
    kty: string;
    alg: string;
    use: string;
    n: string;
    e: string;
};

export type TKakaoUserInfo = {
    id: number;
    has_signed_up: boolean;
    connected_at: Date;
    synched_at: Date;
    properties: {
        nickname?: string;
        thumbnail_image_url?: string;
        profile_image_url?: string;
        is_default_image?: boolean;
    };
    kakao_account: Partial<{
        profile_needs_agreement: boolean;
        profile_nickname_needs_agreement: boolean;
        profile_image_needs_agreement: boolean;
        profile: Record<string, any>;
        name_needs_agreement: boolean;
        name: string;
        email_needs_agreement;
        Boolean;
        is_email_valid: boolean;
        is_email_verified: boolean;
        email: string;
        age_range_needs_agreement: boolean;
        age_range: string;
        birthyear_needs_agreement: boolean;
        birthyear: string;
        birthday_needs_agreement: boolean;
        birthday: string;
        birthday_type: string;
        gender_needs_agreement: boolean;
        gender: string;
        phone_number_needs_agreement: boolean;
        phone_number: string;
        ci_needs_agreement: boolean;
        ci: string;
        ci_authenticated_at: Date;
    }>;
    for_partner: { uuid: string };
};

export type TNaverUserInfo = {
    resultCode: string;
    message: string;
    response: {
        id: string;
        nickname: string;
        name: string;
        email: string;
        gender: TGender;
        age: string;
        birthday: string;
        profile_image: string;
        birthyear: string;
        mobile: string;
    };
};

export type TNaverExtraInfo = Pick<TNaverUserInfo['response'], 'birthday' | 'birthyear' | 'gender' | 'mobile'>;
