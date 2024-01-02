import { TTokenPayload } from '@module/type/token.type';

export const SYSTEM_TOKEN: TTokenPayload = {
    userId: 'SYSTEM',
    loginId: 'SYSTEM',
    name: 'SYSTEM',
    loginType: 'SYSTEM',
};

export const loggingMsgFormat = {
    user: { message: '${msg} (userId: ${userId}, loginId: ${loginId})', param: ['userId', 'loginId'] },
    auth: { message: '${msg} (userId: ${userId}, loginId: ${loginId})', param: ['userId', 'loginId'] },
    post: {},
    comment: {},
    like: {},
};
