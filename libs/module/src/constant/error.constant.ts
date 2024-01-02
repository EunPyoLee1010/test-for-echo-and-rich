export const ERROR_TYPE_LIST = ['business', 'system', 'database'] as const;
export type ERROR_TYPE = {
    type: (typeof ERROR_TYPE_LIST)[number];
    code?: number;
    message: string;
};

// 4XXX Business 오류
//// 40XX 사용자 관련 비즈니스 로직 오류
// 5XXX Database 오류
//// 50XX 사용자 관련 데이터베이스 오류

export const ERROR_OAUTH_FAILED: Readonly<ERROR_TYPE> = {
    type: 'business',
    code: 4000,
    message: `OAuth2 로그인에 실패했습니다.`,
};

export const ERROR_LOGIN_ID_EXIST: Readonly<ERROR_TYPE> = {
    type: 'business',
    code: 4001,
    message: `같은 로그인 ID의 사용자가 존재합니다.`,
};

export const ERROR_CREATE_USER: Readonly<ERROR_TYPE> = {
    type: 'business',
    code: 4002,
    message: `사용자 생성에 실패하였습니다.`,
};

export const ERROR_LOGIN_ID_NOT_FOUND: Readonly<ERROR_TYPE> = {
    type: 'business',
    code: 4003,
    message: `Token 정보에 로그인 ID가 존재하지 않습니다.`,
};

export const ERROR_USER_NOT_FOUND: Readonly<ERROR_TYPE> = {
    type: 'business',
    code: 4004,
    message: `사용자를 찾을 수 없습니다.`,
};

export const ERROR_CREATE_TOKEN: Readonly<ERROR_TYPE> = {
    type: 'business',
    code: 4005,
    message: `사용자 토큰 생성에 실패했습니다`,
};

export const ERROR_UNIQUE_USER_INFO_NOT_FOUND: Readonly<ERROR_TYPE> = {
    type: 'business',
    code: 4006,
    message: `조회하기 위한 USER 정보가 입력되지 않았습니다.`,
};

export const ERROR_INVALID_OAUTH_TOKEN: Readonly<ERROR_TYPE> = {
    type: 'business',
    code: 4010,
    message: `유효하지 않은 Oauth Token 입니다`,
};

export const ERROR_INVALID_TOKEN: Readonly<ERROR_TYPE> = {
    type: 'business',
    code: 4011,
    message: `유효하지 않은 Token 입니다`,
};

export const ERROR_PHONE_NUMBER_EXIST: Readonly<ERROR_TYPE> = {
    type: 'business',
    code: 4012,
    message: `해당 전화번호로 등록된 계정이 존재합니다.`,
};

export const ERROR_PHONE_NUMBER_NOT_VERIFIED: Readonly<ERROR_TYPE> = {
    type: 'business',
    code: 4013,
    message: `인증 완료되지 않은 전화번호입니다.`,
};

export const ERROR_CREATE_UPLOAD_URL: Readonly<ERROR_TYPE> = {
    type: 'business',
    code: 4900,
    message: `미디어 업로드를 실패하였습니다. (Url 생성 실패)`,
};

export const ERROR_FILE_PATH_NOT_FOUND: Readonly<ERROR_TYPE> = {
    type: 'business',
    code: 4901,
    message: `찾을 수 없는 파일 경로 입니다.`,
};

export const ERROR_DATABASE_USER_SELECT: Readonly<ERROR_TYPE> = {
    type: 'database',
    code: 5000,
    message: `사용자 조회에 실패했습니다.`,
};

export const ERROR_DATABASE_USER_DELETE: Readonly<ERROR_TYPE> = {
    type: 'database',
    code: 5001,
    message: `회원 탈퇴에 실패했습니다.`,
};

export const ERROR_SYSTEM_LOGIC: Readonly<ERROR_TYPE> = {
    type: 'system',
    code: 6000,
    message: `서버에서 예기치 않은 오류가 발생하였습니다.`,
};
