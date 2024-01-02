import { TTokenPayload } from '@module/type/token.type';

export type TSendChatInfo = {
    roomId: string;
    event: string;
    chat: TChatInfo;
};

export type TChatInfo = {
    token: TTokenPayload;
    message: string;
    sendTime?: Date;
};
