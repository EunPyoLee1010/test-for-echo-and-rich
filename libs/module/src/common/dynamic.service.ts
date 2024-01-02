import { ConfigModule, ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import Joi from 'joi';
import { RedisClientOptions, RedisModule } from '@liaoliaots/nestjs-redis';

export class CoreDynamicModule {
    static create() {
        return new CoreDynamicModule();
    }

    public configModule() {
        const envFilePath = this.getEnvFilePath();
        const validationSchema = Joi.object({
            NODE_ENV: Joi.string().valid('development', 'production', 'test').default('production'),
            API_PORT: Joi.number().default(3000),
            SOCKET_PORT: Joi.number().default(3000),
            SOCKET_NAMESPACE: Joi.string().default('test'),

            RDBMS_URL: Joi.string().default('postgresql://user:passwd@postgresql:5432'),

            REDIS_HOST: Joi.string().default('localhost'),
            REDIS_PORT: Joi.number().default(6379),
            REDIS_USERNAME: Joi.optional().default('default'),
            REDIS_PASSWORD: Joi.optional().default(''),

            GOOGLE_CLIENT_ID_IOS: Joi.string(),
            GOOGLE_CLIENT_ID_WEB: Joi.string(),
            GOOGLE_CLIENT_SECRET: Joi.string(),

            KAKAO_ADMIN_KEY: Joi.string(),
            KAKAO_CLIENT_ID_WEB: Joi.string(),
            KAKAO_CLIENT_ID_IOS: Joi.string(),
            KAKAO_CLIENT_SECRET: Joi.string(),

            NAVER_CLIENT_ID: Joi.string(),
            NAVER_CLIENT_SECRET: Joi.string(),

            REDIRECT_URL: Joi.string(),

            NCP_ACCESS_KEY: Joi.string(),
            NCP_SECRET_KEY: Joi.string(),
            NCP_SERVICE_ID: Joi.string(),

            AWS_ACCESS_KEY: Joi.string(),
            AWS_SECRET_KEY: Joi.string(),
            AWS_BUCKET_REGION: Joi.string().default('ap-northeast-2'),
            AWS_BUCKET_NAME: Joi.string(),
            AWS_BUCKET_EXPIRES_IN: Joi.number().default(3 * 60),

            JWT_SECRET: Joi.string(),
            JWT_EXPIRE_TIME: Joi.string().default('1h'),

            STABLE_SCHEDULER_TIME: Joi.number().default(60 * 1000), //ms
        });

        return ConfigModule.forRoot({
            isGlobal: true,
            envFilePath,
            validationSchema,
        });
    }

    public redisModule() {
        return RedisModule.forRootAsync(
            {
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (config: ConfigService) => this.getRedisConfig(config),
            },
            true
        );
    }

    private getRedisConfig(configService: ConfigService) {
        const config: RedisClientOptions = {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
            username: configService.get('REDIS_USERNAME'),
            password: configService.get('REDIS_PASSWORD'),
        };
        return { config, readyLog: true, errorLog: true };
    }

    public getEnvFilePath() {
        const envFileName = `.${process.env.NODE_ENV ?? 'production'}.env`;
        const envFilePath = [envFileName];
        while (!existsSync(envFilePath.join(''))) {
            envFilePath.unshift('../');
            if (envFilePath.length > 5) {
                break;
            }
        }

        return envFilePath.join('');
    }
}
