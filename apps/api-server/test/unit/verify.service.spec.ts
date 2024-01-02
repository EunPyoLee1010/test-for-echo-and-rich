import { Test, TestingModule } from '@nestjs/testing';
import { VerifyService } from '../../src/router/auth/verify/verify.service';
import { SmsVerificationService } from '@api-server/core/verification/sms.service';
import { EmailVerificationService } from '@api-server/core/verification/email.service';
import { CacheService } from '@repository/cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { PostSendBodyDto, PostVerifyBodyDto } from '@api-server/type/dto/verify.dto';
import { HttpService } from '@nestjs/axios';
import { TVerificationResult, TVerifyTarget } from '@module/type/verify.type';
import { isErrorType } from '@module/module/error';
import { ERROR_TYPE } from '@module/constant/error.constant';

const cacheInfo: Record<string, string> = {};
const testPhoneNumber = '010-2675-3706';

const envMock = {
    NODE_ENV: 'test',

    NCP_ACCESS_KEY: 'NCP_ACCESS_KEY',
    NCP_SECRET_KEY: 'NCP_SECRET_KEY',
    NCP_SERVICE_ID: 'NCP_SERVICE_ID',
};

describe('smsVerifyService', () => {
    let service: VerifyService;
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
                SmsVerificationService,
                EmailVerificationService,
                VerifyService,
                {
                    provide: HttpService,
                    useValue: {
                        axiosRef: {
                            post: jest.fn().mockResolvedValue({ data: { statusCode: '202' } }),
                        },
                    },
                },
                {
                    provide: CacheService,
                    useValue: {
                        get: jest.fn(async (key: string) => cacheInfo[key]),
                        set: jest.fn(async (key: string, value: string, ttl?: number) => {
                            cacheInfo[key] = value;
                        }),
                        del: jest.fn(async (...keyList: string[]) => {
                            for (const key of keyList) cacheInfo[key] = undefined;
                        }),
                        getCodeRedisKey: jest.fn(
                            (target: TVerifyTarget, value: string) => `verification/${target}/${value}/code`
                        ),
                        getVerifiedRedisKey: jest.fn(
                            (target: TVerifyTarget, value: string) => `verification/${target}/${value}/verified`
                        ),
                    },
                },
            ],
        }).compile();

        service = module.get<VerifyService>(VerifyService);
        cacheService = module.get<CacheService>(CacheService);
        httpService = module.get<HttpService>(HttpService);
    });

    it('선언 여부', () => {
        expect(service).toBeDefined();
    });

    it('SMS 인증번호 전송 실패', async () => {
        jest.spyOn(httpService.axiosRef, 'post').mockImplementationOnce(async () => ({
            data: {
                statusCode: '400',
            },
        }));
        const sendSmsInfo: PostSendBodyDto = {
            verifyTarget: 'phoneNumber',
            phoneNumber: testPhoneNumber,
            isRefresh: false,
        };
        const sendResult = await service.send(sendSmsInfo);
        const { type, code, message } = sendResult as Readonly<ERROR_TYPE>;
        expect(isErrorType(sendResult)).toBe(true);
        expect(type).toBe('business');
        expect(code).toBe(4008);
        expect(message).toBe('인증 번호 전송에 실패하였습니다.');
    });

    it('SMS 인증번호 전송 성공', async () => {
        const sendSmsInfo: PostSendBodyDto = {
            verifyTarget: 'phoneNumber',
            phoneNumber: testPhoneNumber,
            isRefresh: false,
        };
        const sendResult = await service.send(sendSmsInfo);
        expect(isErrorType(sendResult)).toBe(false);

        const { result, phoneNumber } = sendResult as TVerificationResult;
        expect(result).toBe(true);
        expect(phoneNumber).toBe(testPhoneNumber);
    });

    it('SMS 인증번호 재발급 성공', async () => {
        const sendSmsInfo: PostSendBodyDto = {
            verifyTarget: 'phoneNumber',
            phoneNumber: testPhoneNumber,
            isRefresh: true,
        };
        const sendResult = await service.send(sendSmsInfo);
        expect(isErrorType(sendResult)).toBe(false);

        const { result, phoneNumber } = sendResult as TVerificationResult;
        expect(result).toBe(true);
        expect(phoneNumber).toBe(testPhoneNumber);
    });

    it('SMS 인증번호 발급 후 재발급 요청없이 그냥 요청한 경우 실패', async () => {
        const sendSmsInfo: PostSendBodyDto = {
            verifyTarget: 'phoneNumber',
            phoneNumber: testPhoneNumber,
            isRefresh: false,
        };
        const sendResult = await service.send(sendSmsInfo);
        const { type, code, message } = sendResult as Readonly<ERROR_TYPE>;
        expect(isErrorType(sendResult)).toBe(true);
        expect(type).toBe('business');
        expect(code).toBe(4009);
        expect(message).toBe('이미 인증 번호 전송을 시도하였습니다.');
    });

    it('SMS 인증 번호 검증 성공', async () => {
        const verifySmsInfo: PostVerifyBodyDto = {
            verifyTarget: 'phoneNumber',
            phoneNumber: testPhoneNumber,
            code: await cacheService.get(cacheService.getCodeRedisKey('phoneNumber', testPhoneNumber)),
        };

        const sendResult = await service.verify(verifySmsInfo);
        expect(isErrorType(sendResult)).toBe(false);

        const { result, phoneNumber } = sendResult as TVerificationResult;
        expect(result).toBe(true);
        expect(phoneNumber).toBe(testPhoneNumber);
    });

    it('SMS 인증 번호 검증 실패', async () => {
        const verifySmsInfo: PostVerifyBodyDto = {
            verifyTarget: 'phoneNumber',
            phoneNumber: testPhoneNumber,
            code: 'abcdef',
        };

        const sendResult = await service.verify(verifySmsInfo);
        const { type, code, message } = sendResult as Readonly<ERROR_TYPE>;
        expect(isErrorType(sendResult)).toBe(true);
        expect(type).toBe('business');
        expect(code).toBe(4010);
        expect(message).toBe('인증번호가 일치하지 않습니다.');
    });

    it('SMS 인증번호 전송 요청 없이 재발급 받으려고 하는 경우 실패', async () => {
        await cacheService.del(cacheService.getCodeRedisKey('phoneNumber', testPhoneNumber));

        const sendSmsInfo: PostSendBodyDto = {
            verifyTarget: 'phoneNumber',
            phoneNumber: testPhoneNumber,
            isRefresh: true,
        };
        const sendResult = await service.send(sendSmsInfo);
        const { type, code, message } = sendResult as Readonly<ERROR_TYPE>;
        expect(isErrorType(sendResult)).toBe(true);
        expect(type).toBe('business');
        expect(code).toBe(4011);
        expect(message).toBe('잘못된 인증번호 재전송 요청입니다.');
    });
});
