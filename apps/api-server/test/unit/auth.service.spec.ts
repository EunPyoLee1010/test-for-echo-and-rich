/* eslint-disable camelcase */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/router/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { RDBMSConnectionManager } from '@repository/rdbms/manager';
import { UserRepository } from '@repository/rdbms/user/user.repository';
import { TRequestInfo } from '@module/type/request.type';
import { GoogleOauthService } from '@api-server/core/oauth/provider/google.auth';
import { UserService } from '../../src/router/user/user.service';
import { KakaoOauthService } from '@api-server/core/oauth/provider/kakao.auth';
import { CacheService } from '@repository/cache/cache.service';
import { TOauthExtraProfile, TOauthTokenInfo, TOauthUserProfile } from '@module/type/oauth.type';
import { HttpService } from '@nestjs/axios';
import { NaverOauthService } from '@api-server/core/oauth/provider/naver.auth';
import { LoginTicket, OAuth2Client, TokenPayload } from 'google-auth-library';
import { people_v1 } from 'googleapis';
import { isErrorType } from '@module/module/error';
import { GetAuthCallbackResponse } from '@api-server/type/dto/auth.dto';
import { JsonWebTokenError, verify } from 'jsonwebtoken';
import { createHash, createSalt, encryptJwtSecretKey } from '@module/module/encryption';
import { ERROR_TYPE } from '@module/constant/error.constant';
import { LogService } from '@module/module/log/log.service';

const envMock = {
    NODE_ENV: 'test',
    RDBMS_URL: 'postgresql://posgres:1q2w3e4r@@Q@localhost:5432',

    GOOGLE_CLIENT_ID_IOS: 'GOOGLE_CLIENT_ID_IOS',
    GOOGLE_CLIENT_ID_WEB: 'GOOGLE_CLIENT_ID_WEB',
    GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET',

    KAKAO_ADMIN_KEY: 'KAKAO_ADMIN_KEY',
    KAKAO_CLIENT_ID_WEB: 'KAKAO_CLIENT_ID_WEB',
    KAKAO_CLIENT_ID_IOS: 'KAKAO_CLIENT_ID_IOS',
    KAKAO_CLIENT_SECRET: 'KAKAO_CLIENT_SECRET',

    NAVER_CLIENT_ID: 'NAVER_CLIENT_ID',
    NAVER_CLIENT_SECRET: 'NAVER_CLIENT_SECRET',

    REDIRECT_URL: 'http://localhost:3000/api/v1/user/auth/callback',
    JWT_SECRET: 'test-jwt-secret',
    JWT_EXPIRE_TIME: '1h',
};

const testRequestInfo: TRequestInfo = { ipAddress: '127.0.0.1', userAgent: 'node' };
const testTokenPayload: TokenPayload = {
    iss: 'https://accounts.google.com',
    aud: 'apps.googleusercontent.com',
    email: 'user@gmail.com',
    picture: '',
    name: 'user',
    sub: '1234567890',
    iat: 1677213470,
    exp: 1677217070,
};
const testUserInfo: TOauthUserProfile = { loginId: 'user@gmail.com', name: 'user', passwd: '1234567890', picture: '' };
const testTokenInfo: TOauthTokenInfo = { accessToken: 'accessToken', idToken: 'idToken' };
const testUserEtcInfo: TOauthExtraProfile = {
    info: { gender: 'M', phoneNumber: '010-2675-3706', birthday: '1996-10-10' },
    additionalInfo: [],
};

describe('GoogleOauthService', () => {
    let service: AuthService;
    let userService: UserService;
    let googleOauthService: GoogleOauthService;
    let googleOauthClient: OAuth2Client;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => envMock[key]),
                    },
                },
                GoogleOauthService,
                KakaoOauthService,
                NaverOauthService,
                UserService,
                UserRepository,
                AuthService,
                LogService,
                { provide: RDBMSConnectionManager, useValue: {} },
                { provide: HttpService, useValue: {} },
                { provide: CacheService, useValue: {} },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
        googleOauthService = module.get<GoogleOauthService>(GoogleOauthService);
        googleOauthClient = (googleOauthService as any).oauthClient;

        jest.spyOn(userService, 'isExist').mockReturnValue(Promise.resolve(false));
        jest.spyOn(userService, 'get').mockReturnValue(Promise.resolve(undefined));
        jest.spyOn(userService, 'create').mockReturnValue(Promise.resolve(true));
        jest.spyOn(googleOauthClient, 'getToken').mockImplementation(async () => ({
            tokens: { id_token: 'id_token', access_token: 'access_token' },
        }));
        jest.spyOn(googleOauthClient, 'verifyIdToken').mockImplementation(
            async () => new LoginTicket('', testTokenPayload)
        );

        jest.spyOn(googleOauthService as any, 'getPeopleResource').mockImplementation(
            async () =>
                ({
                    birthdays: [{ date: { year: 1996, month: 10, day: 10 } }],
                    phoneNumbers: [{ value: '010-2675-3706' }],
                    genders: [{ value: 'male' }],
                } as people_v1.Schema$Person)
        );
    });

    it('선언 여부', () => {
        expect(service).toBeDefined();
    });

    it('[Google] 테스트 용 oauth url 생성', () => {
        const url = service.getUrl({ type: 'google' });
        expect(typeof url).toBe('string');
    });

    it('[Google] 기존 유저가 없을 경우 회원 가입 후 로그인', async () => {
        const tokenResult = await service.getToken({ code: 'test', type: 'google' }, testRequestInfo);
        const { loginResult, token, expiresIn } = tokenResult as GetAuthCallbackResponse;

        expect(isErrorType(tokenResult)).toBe(false);
        expect(loginResult).toBe(true);
        expect(expiresIn).toBe('1h');
        expect(() => verify(token, encryptJwtSecretKey({ ...testRequestInfo }, envMock['JWT_SECRET']))).not.toThrow(
            JsonWebTokenError
        );
    });

    it('[Google] 기존 유저가 존재할 경우 로그인', async () => {
        const passwdSalt = createSalt();
        const passwdEnc = createHash(testUserInfo.passwd, passwdSalt);

        jest.spyOn(userService, 'isExist').mockReturnValueOnce(Promise.resolve(true));
        jest.spyOn(userService, 'get').mockReturnValueOnce(
            Promise.resolve({ ...testUserInfo, ...testUserEtcInfo, passwdEnc, passwdSalt } as any)
        );

        const tokenResult = await service.getToken({ code: 'test', type: 'google' }, testRequestInfo);
        const { loginResult, token, expiresIn } = tokenResult as GetAuthCallbackResponse;

        expect(isErrorType(tokenResult)).toBe(false);
        expect(loginResult).toBe(true);
        expect(expiresIn).toBe('1h');
        expect(() => verify(token, encryptJwtSecretKey({ ...testRequestInfo }, envMock['JWT_SECRET']))).not.toThrow(
            JsonWebTokenError
        );
    });

    it('[Google] 기존 유저가 존재하고, 비밀번호가 다를 경우 token 생성하지 않음', async () => {
        const passwdSalt = createSalt();
        const passwdEnc = createHash('wrong password', passwdSalt);

        jest.spyOn(userService, 'isExist').mockReturnValueOnce(Promise.resolve(true));
        jest.spyOn(userService, 'get').mockReturnValueOnce(
            Promise.resolve({ ...testUserInfo, ...testUserEtcInfo, passwdEnc, passwdSalt } as any)
        );

        const tokenResult = await service.getToken({ code: 'test', type: 'google' }, testRequestInfo);
        const { type, code, message } = tokenResult as Readonly<ERROR_TYPE>;

        expect(isErrorType(tokenResult)).toBe(true);
        expect(type).toBe('business');
        expect(code).toBe(4001);
        expect(message).toBe('같은 로그인 ID의 사용자가 존재합니다.');
    });

    it('[Google] 앱 로그인 시, 가입돼있지 않고, 필요한 정보가 전부 제공된 경우', async () => {
        const tokenResult = await service.login(
            { ...testTokenInfo, payload: testUserInfo, type: 'google' },
            testRequestInfo
        );
        const { loginResult, token, expiresIn } = tokenResult as GetAuthCallbackResponse;

        expect(isErrorType(tokenResult)).toBe(false);
        expect(loginResult).toBe(true);
        expect(expiresIn).toBe('1h');
        expect(() => verify(token, encryptJwtSecretKey({ ...testRequestInfo }, envMock['JWT_SECRET']))).not.toThrow(
            JsonWebTokenError
        );
    });

    it('[Google] 앱 로그인 시, 가입돼있지 않고, 필요한 정보가 제공되지 않은 경우', async () => {
        jest.spyOn(googleOauthService as any, 'getPeopleResource').mockImplementationOnce(
            async () => ({ birthdays: [], phoneNumbers: [], genders: [] } as people_v1.Schema$Person)
        );

        const tokenResult = await service.login(
            { ...testTokenInfo, payload: testUserInfo, type: 'google' },
            testRequestInfo
        );
        const { loginResult, token, userInfo } = tokenResult as GetAuthCallbackResponse;
        const { birthday, gender, phoneNumber } = userInfo;

        expect(isErrorType(tokenResult)).toBe(false);
        expect(loginResult).toBe(false);
        expect(token).toBe(undefined);
        expect(birthday).toBe(null);
        expect(phoneNumber).toBe(null);
        expect(gender).toBe(null);
    });
});

describe('KakaoOauthService', () => {
    let service: AuthService;
    let userService: UserService;
    let kakaoOauthService: KakaoOauthService;
    let httpService: HttpService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => envMock[key]),
                    },
                },
                KakaoOauthService,
                GoogleOauthService,
                NaverOauthService,
                UserService,
                RDBMSConnectionManager,
                AuthService,
                LogService,
                UserRepository,
                { provide: RDBMSConnectionManager, useValue: {} },
                { provide: HttpService, useValue: { axiosRef: { get: jest.fn(), post: jest.fn() } } },
                { provide: CacheService, useValue: {} },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
        kakaoOauthService = module.get<KakaoOauthService>(KakaoOauthService);
        httpService = module.get<HttpService>(HttpService);

        jest.spyOn(userService, 'isExist').mockReturnValue(Promise.resolve(false));
        jest.spyOn(userService, 'get').mockReturnValue(Promise.resolve(undefined));
        jest.spyOn(userService, 'create').mockReturnValue(Promise.resolve(true));
        jest.spyOn(httpService.axiosRef, 'post').mockImplementation(async () => ({
            data: { token: { id_token: 'id_token', access_token: 'access_token' } },
        }));

        jest.spyOn(httpService.axiosRef, 'get').mockImplementation(async () => ({
            data: { kakao_account: { ...testUserEtcInfo.info, phone_number: testUserEtcInfo.info.phoneNumber } },
        }));

        jest.spyOn(kakaoOauthService, 'verifyIdToken').mockImplementation(async () => ({
            verified: true,
            payload: testUserInfo,
        }));
    });

    it('선언 여부', () => {
        expect(service).toBeDefined();
    });

    it('[Kakao] 테스트 용 oauth url 생성', () => {
        const url = service.getUrl({ type: 'kakao' });
        expect(typeof url).toBe('string');
    });

    it('[Kakao] 기존 유저가 없을 경우 회원 가입 후 로그인', async () => {
        const tokenResult = await service.getToken({ code: 'test', type: 'kakao' }, testRequestInfo);

        const { loginResult, token, expiresIn } = tokenResult as GetAuthCallbackResponse;
        expect(isErrorType(tokenResult)).toBe(false);
        expect(loginResult).toBe(true);
        expect(expiresIn).toBe('1h');
        expect(() => verify(token, encryptJwtSecretKey({ ...testRequestInfo }, envMock['JWT_SECRET']))).not.toThrow(
            JsonWebTokenError
        );
    });

    it('[Kakao] 기존 유저가 존재할 경우 로그인', async () => {
        const passwdSalt = createSalt();
        const passwdEnc = createHash(testUserInfo.passwd, passwdSalt);

        jest.spyOn(userService, 'isExist').mockReturnValueOnce(Promise.resolve(true));
        jest.spyOn(userService, 'get').mockReturnValueOnce(
            Promise.resolve({ ...testUserInfo, ...testUserEtcInfo, passwdEnc, passwdSalt } as any)
        );

        const tokenResult = await service.getToken({ code: 'test', type: 'kakao' }, testRequestInfo);
        const { loginResult, token, expiresIn } = tokenResult as GetAuthCallbackResponse;

        expect(isErrorType(tokenResult)).toBe(false);
        expect(loginResult).toBe(true);
        expect(expiresIn).toBe('1h');
        expect(() => verify(token, encryptJwtSecretKey({ ...testRequestInfo }, envMock['JWT_SECRET']))).not.toThrow(
            JsonWebTokenError
        );
    });

    it('[Kakao] 기존 유저가 존재하고, 비밀번호가 다를 경우 token 생성하지 않음', async () => {
        const passwdSalt = createSalt();
        const passwdEnc = createHash('wrong password', passwdSalt);

        jest.spyOn(userService, 'isExist').mockReturnValueOnce(Promise.resolve(true));
        jest.spyOn(userService, 'get').mockReturnValueOnce(
            Promise.resolve({ ...testUserInfo, ...testUserEtcInfo, passwdEnc, passwdSalt } as any)
        );

        const tokenResult = await service.getToken({ code: 'test', type: 'kakao' }, testRequestInfo);
        const { type, code, message } = tokenResult as Readonly<ERROR_TYPE>;

        expect(isErrorType(tokenResult)).toBe(true);
        expect(type).toBe('business');
        expect(code).toBe(4001);
        expect(message).toBe('같은 로그인 ID의 사용자가 존재합니다.');
    });

    it('[Kakao] 앱 로그인 시, 가입돼있지 않고, 필요한 정보가 전부 제공된 경우', async () => {
        const tokenResult = await service.login(
            { ...testTokenInfo, payload: testUserInfo, type: 'kakao' },
            testRequestInfo
        );
        const { loginResult, token, expiresIn } = tokenResult as GetAuthCallbackResponse;

        expect(isErrorType(tokenResult)).toBe(false);
        expect(loginResult).toBe(true);
        expect(expiresIn).toBe('1h');
        expect(() => verify(token, encryptJwtSecretKey({ ...testRequestInfo }, envMock['JWT_SECRET']))).not.toThrow(
            JsonWebTokenError
        );
    });

    it('[Kakao] 앱 로그인 시, 가입돼있지 않고, 필요한 정보가 제공되지 않은 경우', async () => {
        jest.spyOn(httpService.axiosRef, 'get').mockImplementation(async () => ({
            data: { kakao_account: {} },
        }));

        const tokenResult = await service.login(
            { ...testTokenInfo, payload: testUserInfo, type: 'kakao' },
            testRequestInfo
        );
        const { loginResult, token, userInfo } = tokenResult as GetAuthCallbackResponse;
        const { birthday, gender, phoneNumber } = userInfo;

        expect(isErrorType(tokenResult)).toBe(false);
        expect(loginResult).toBe(false);
        expect(token).toBe(undefined);
        expect(birthday).toBe(null);
        expect(phoneNumber).toBe(null);
        expect(gender).toBe(null);
    });
});

describe('NaverOauthService', () => {
    const cacheInfo: Record<string, any> = {};
    let service: AuthService;
    let userService: UserService;
    let naverOauthService: NaverOauthService;
    let httpService: HttpService;
    let cacheService: CacheService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => envMock[key]),
                    },
                },
                KakaoOauthService,
                GoogleOauthService,
                NaverOauthService,
                UserService,
                RDBMSConnectionManager,
                AuthService,
                LogService,
                UserRepository,
                { provide: RDBMSConnectionManager, useValue: {} },
                { provide: HttpService, useValue: { axiosRef: { get: jest.fn(), post: jest.fn() } } },
                {
                    provide: CacheService,
                    useValue: { hgetall: jest.fn(), hmset: jest.fn(), getExtraInfoRedisKey: jest.fn() },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
        naverOauthService = module.get<NaverOauthService>(NaverOauthService);
        httpService = module.get<HttpService>(HttpService);
        cacheService = module.get<CacheService>(CacheService);

        jest.spyOn(userService, 'isExist').mockReturnValue(Promise.resolve(false));
        jest.spyOn(userService, 'get').mockReturnValue(Promise.resolve(undefined));
        jest.spyOn(userService, 'create').mockReturnValue(Promise.resolve(true));

        jest.spyOn(cacheService, 'hgetall').mockImplementation(async (key) => cacheInfo[key as string]);
        jest.spyOn(cacheService, 'hmset').mockImplementation(async (key, value) => {
            cacheInfo[key as string] = value;
            return true;
        });
        jest.spyOn(cacheService, 'getExtraInfoRedisKey').mockImplementation(
            (provider, email) => `oauth/${provider}/extraInfo/${email}`
        );

        jest.spyOn(httpService.axiosRef, 'get').mockImplementation(async () => ({
            data: {
                response: {
                    ...testTokenPayload,
                    ...testUserEtcInfo.info,
                    id: testTokenPayload.sub,
                    profile_image: '',
                    birthday: '10-10',
                    birthyear: '1996',
                    mobile: '010-2675-3706',
                },
            },
        }));
        jest.spyOn(naverOauthService, 'getTokenFromCode').mockImplementation(async () => ({
            idToken: 'access_token',
            accessToken: 'access_token',
        }));
    });

    it('선언 여부', () => {
        expect(service).toBeDefined();
    });

    it('[Naver] 테스트 용 oauth url 생성', () => {
        const url = service.getUrl({ type: 'kakao' });
        expect(typeof url).toBe('string');
    });

    it('[Naver] 기존 유저가 없을 경우 회원 가입 후 로그인', async () => {
        const tokenResult = await service.getToken({ code: 'test', type: 'naver' }, testRequestInfo);
        console.log(tokenResult);
        console.log(cacheInfo);
        const { loginResult, token, expiresIn } = tokenResult as GetAuthCallbackResponse;
        expect(isErrorType(tokenResult)).toBe(false);
        expect(loginResult).toBe(true);
        expect(expiresIn).toBe('1h');
        expect(() => verify(token, encryptJwtSecretKey({ ...testRequestInfo }, envMock['JWT_SECRET']))).not.toThrow(
            JsonWebTokenError
        );
    });

    it('[Naver] 기존 유저가 존재할 경우 로그인', async () => {
        const passwdSalt = createSalt();
        const passwdEnc = createHash(testUserInfo.passwd, passwdSalt);

        jest.spyOn(userService, 'isExist').mockReturnValueOnce(Promise.resolve(true));
        jest.spyOn(userService, 'get').mockReturnValueOnce(
            Promise.resolve({ ...testUserInfo, ...testUserEtcInfo, passwdEnc, passwdSalt } as any)
        );

        const tokenResult = await service.getToken({ code: 'test', type: 'naver' }, testRequestInfo);
        const { loginResult, token, expiresIn } = tokenResult as GetAuthCallbackResponse;

        expect(isErrorType(tokenResult)).toBe(false);
        expect(loginResult).toBe(true);
        expect(expiresIn).toBe('1h');
        expect(() => verify(token, encryptJwtSecretKey({ ...testRequestInfo }, envMock['JWT_SECRET']))).not.toThrow(
            JsonWebTokenError
        );
    });

    it('[Naver] 기존 유저가 존재하고, 비밀번호가 다를 경우 token 생성하지 않음', async () => {
        const passwdSalt = createSalt();
        const passwdEnc = createHash('wrong password', passwdSalt);

        jest.spyOn(userService, 'isExist').mockReturnValueOnce(Promise.resolve(true));
        jest.spyOn(userService, 'get').mockReturnValueOnce(
            Promise.resolve({ ...testUserInfo, ...testUserEtcInfo, passwdEnc, passwdSalt } as any)
        );

        const tokenResult = await service.getToken({ code: 'test', type: 'naver' }, testRequestInfo);
        const { type, code, message } = tokenResult as Readonly<ERROR_TYPE>;

        expect(isErrorType(tokenResult)).toBe(true);
        expect(type).toBe('business');
        expect(code).toBe(4001);
        expect(message).toBe('같은 로그인 ID의 사용자가 존재합니다.');
    });

    it('[Naver] 앱 로그인 시, 가입돼있지 않고, 필요한 정보가 전부 제공된 경우', async () => {
        const tokenResult = await service.login(
            { ...testTokenInfo, payload: testUserInfo, type: 'naver' },
            testRequestInfo
        );
        const { loginResult, token, expiresIn } = tokenResult as GetAuthCallbackResponse;

        expect(isErrorType(tokenResult)).toBe(false);
        expect(loginResult).toBe(true);
        expect(expiresIn).toBe('1h');
        expect(() => verify(token, encryptJwtSecretKey({ ...testRequestInfo }, envMock['JWT_SECRET']))).not.toThrow(
            JsonWebTokenError
        );
    });

    it('[Naver] 앱 로그인 시, 가입돼있지 않고, 필요한 정보가 제공되지 않은 경우', async () => {
        jest.spyOn(httpService.axiosRef, 'get').mockImplementationOnce(async () => ({
            data: {
                response: {
                    ...testTokenPayload,
                    ...testUserEtcInfo.info,
                    id: testTokenPayload.sub,
                    profile_image: '',
                    gender: undefined,
                },
            },
        }));

        const tokenResult = await service.login(
            { ...testTokenInfo, payload: testUserInfo, type: 'naver' },
            testRequestInfo
        );
        const { loginResult, token, userInfo } = tokenResult as GetAuthCallbackResponse;
        const { birthday, gender, phoneNumber } = userInfo;

        expect(isErrorType(tokenResult)).toBe(false);
        expect(loginResult).toBe(false);
        expect(token).toBe(undefined);
        expect(birthday).toBe(null);
        expect(phoneNumber).toBe(null);
        expect(gender).toBe(null);
    });
});
