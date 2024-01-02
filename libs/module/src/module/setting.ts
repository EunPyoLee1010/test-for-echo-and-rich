import {
    //ClassSerializerInterceptor,
    INestApplication,
    NotFoundException,
    ValidationPipe,
    WebSocketAdapter,
} from '@nestjs/common';
import helmet from 'helmet';
import { v4 } from 'uuid';
import { createLogMessage } from '@module/module/log/logging';
import { NextFunction, Request, Response, json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@module/common/filter/exception.filter';
import { LogService } from './log/log.service';
import { SYSTEM_TOKEN } from '@module/constant/log.constant';
import { HttpAdapterHost } from '@nestjs/core';

export function settingBootstrap(
    app: INestApplication,
    { logger, prefix, socketAdapater }: { logger: LogService; prefix: string; socketAdapater: WebSocketAdapter }
) {
    app.enableCors();
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.setGlobalPrefix(prefix);
    app.useGlobalFilters(new HttpExceptionFilter(logger));
    createSwaggerDocs(app, prefix);
    app.use(helmet());

    if (socketAdapater) {
        app.useWebSocketAdapter(socketAdapater);
    }

    app.use((req: Request, _: Response, next: NextFunction) => {
        const uuid = v4();
        req.requestInfo = { uuid, reqStartTime: Date.now() };
        const endpointInfo = app
            .get(HttpAdapterHost)
            .httpAdapter['instance']._router.stack.map((v) => v.route?.path)
            .filter((v) => v);
        const endpointList: string[] = Array.from(new Set(endpointInfo));
        if (!endpointList.some((v) => req.originalUrl.includes(v))) {
            logger.verbose(createLogMessage(uuid, { req }), SYSTEM_TOKEN);
            throw new NotFoundException(`Not Found ${req.url}`);
        }
        next();
    });
}

export function createSwaggerDocs(app: INestApplication, prefix: string) {
    const title = 'API DOCS';
    const description = 'API 문서입니다.';
    const version = '1.0';
    const iconLink = '';
    const options: SwaggerCustomOptions = {
        swaggerOptions: { defaultModelsExpandDepth: -1 },
        customSiteTitle: title,
        customfavIcon: iconLink,
        customCss: `
        .topbar-wrapper img {content:url(${iconLink}); }
        .swagger-ui .topbar { background-color: black; }
        `,
    };
    const config = new DocumentBuilder()
        .setTitle(title)
        .setDescription(description)
        .setVersion(version)
        .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        })
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(prefix + '/docs', app, document, options);
}
