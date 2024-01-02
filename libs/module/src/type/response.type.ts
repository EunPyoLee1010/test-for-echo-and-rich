export type TTransformResponse<T> = {
    statusCode: number;
    path: string;
    timestamp: string;
    response: T;
};
