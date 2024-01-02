import { Expose } from 'class-transformer';

export class ResultSuccessResponse {
    @Expose()
    result: true;

    @Expose()
    id: number;
}
