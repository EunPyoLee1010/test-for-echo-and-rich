import { GetCustomParamDto } from '@api-server/type/dto/custom.dto';
import { ERROR_HTTP_REQUEST_URL } from '@module/constant/error.constant';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';

@Injectable()
export class CustomService {
    private readonly customUrl: string = 'https://jsonplaceholder.typicode.com';
    constructor(private readonly httpService: HttpService) {}

    async get({ field, id }: GetCustomParamDto) {
        try {
            const requestUrl = `${this.customUrl}/${field}/${id}`;
            const response = await this.httpService.axiosRef
                .get(requestUrl)
                .then((v: AxiosResponse) => v.data)
                .catch((e) => {
                    console.log(e);
                    return ERROR_HTTP_REQUEST_URL;
                });
            return response;
        } catch (e) {
            console.log(e);
            return ERROR_HTTP_REQUEST_URL;
        }
    }
}
