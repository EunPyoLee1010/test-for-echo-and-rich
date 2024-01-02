import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ERROR_CREATE_UPLOAD_URL } from '@module/constant/error.constant';
import { SYSTEM_TOKEN } from '@module/constant/log.constant';
import mime from 'mime-types';
import { v4 } from 'uuid';
import { LogService } from '../log/log.service';

@Injectable()
export class UploadService {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly bucketExpiresIn: number;

    constructor(private readonly logger: LogService, private readonly config: ConfigService) {
        const accessKeyId = this.config.get('AWS_ACCESS_KEY');
        const secretAccessKey = this.config.get('AWS_SECRET_KEY');
        const region = this.config.get('AWS_BUCKET_REGION');
        this.bucketName = this.config.get('AWS_BUCKET_NAME');
        this.bucketExpiresIn = this.config.get('AWS_BUCKET_EXPIRES_IN');

        this.s3Client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
    }

    async getPresignedUrl(userId: string, { mimeType }: any) {
        const fileId = v4();
        try {
            const ext = mime.extension(mimeType);
            if (ext === false) {
                this.logger.error(
                    `지원하지 않는 확장자로 url 생성을 시도하였습니다. (mime type: ${mimeType})`,
                    SYSTEM_TOKEN
                );
                return ERROR_CREATE_UPLOAD_URL;
            }
            const uploadFilePath = `upload/${userId}/${fileId}.${ext}`;
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: uploadFilePath,
                ContentType: mimeType,
            });
            const url = await getSignedUrl(this.s3Client, command, { expiresIn: this.bucketExpiresIn });
            return url;
        } catch (e) {
            console.log(e);
            return ERROR_CREATE_UPLOAD_URL;
        }
    }
}
