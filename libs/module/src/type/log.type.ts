export const LOG_LEVEL_LIST = ['info', 'debug', 'verbose', 'warn', 'error'] as const;

export type TLogLevel = (typeof LOG_LEVEL_LIST)[number];

export type TLogSaveInfo = {
    message: string;
    level: TLogLevel;
    userId: string;
};
