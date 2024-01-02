import { UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { SYSTEM_TOKEN } from '@module/constant/log.constant';
import { LogService } from '@module/module/log/log.service';
import { Namespace, Server, Socket } from 'socket.io';
import { SocketToken } from '@module/common/decorator/token.decorator';
import { TSocketInfo, TTokenPayload } from '@module/type/token.type';
import { SocketLoggingInterceptor } from '@module/common/interceptor/logging.interceptor';
import { SocketExceptionFilter } from '@module/common/filter/exception.filter';
import { JwtGuard } from '@module/common/guard/token.guard';

@WebSocketGateway({ namespace: process.env.SOCKET_NAMESPACE || 'test' })
@UseGuards(JwtGuard)
@UseInterceptors(SocketLoggingInterceptor)
@UseFilters(SocketExceptionFilter)
@UsePipes(ValidationPipe)
export class ChatGateway implements OnGatewayInit<Server>, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    static server: Server;

    @WebSocketServer()
    io: Namespace;

    constructor(private readonly config: ConfigService, private readonly logger: LogService) {}

    public afterInit() {
        const port = this.config.get('SOCKET_PORT');
        this.logger.log(
            `${serviceName} Socket 서버가 실행됐습니다. (port: ${port}, namespace: ${this.io.name})`,
            SYSTEM_TOKEN
        );
    }

    public handleConnection(@ConnectedSocket() client: TSocketInfo) {
        client.use(([event], next) => {
            client.handshake.headers.event = event;
            return next();
        });
        const token = client.token;
        this.logger.log(`${this.io.name} Socket에 접속하였습니다. ${client.id}`, token);
        this.logger.debug(`Socket에 현재 연결된 사용자 수는 ${this.io.sockets.size} 명입니다.`, token);
    }

    public handleDisconnect(@ConnectedSocket() client: Socket) {
        this.logger.log(`${this.io.name} Socket에 접속 해제하였습니다. ${client.id}`, SYSTEM_TOKEN);
        this.logger.debug(`Socket에 현재 연결된 사용자 수는 ${this.io.sockets.size} 명입니다.`, SYSTEM_TOKEN);
    }

    @SubscribeMessage('test')
    public async createRoom(
        @ConnectedSocket() client: Socket,
        //Dto 검증 가능
        @MessageBody() testDto: any,
        @SocketToken() token: TTokenPayload
    ) {
        this.logger.log(`소켓 테스트 로그입니다. (Client ID: ${client.id})`, token);
        return { result: true, testData: testDto };
    }
}
