import { Socket } from 'socket.io';

export type TTokenPayload = {
    userId?: string;
    loginId: string;
    name: string;
    loginType: string;
};

export type TSocketInfo = Socket & { requestInfo: { uuid: string; startTime: number }; token: TTokenPayload };
