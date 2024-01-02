import { JwtGuard } from '@module/common/guard/token.guard';
import { ForbiddenException, INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { TSocketInfo } from '@module/type/token.type';
import { UserRepository } from '@repository/rdbms/user/user.repository';
import { CacheService } from '@repository/cache/cache.service';

export class SocketIOAdapter extends IoAdapter {
    private readonly userRepo: UserRepository;
    private readonly cache: CacheService;
    private readonly jwtGuard: JwtGuard;

    constructor(private readonly app: INestApplicationContext, private readonly config: ConfigService) {
        super(app);
        this.userRepo = this.app.get(UserRepository);
        this.cache = this.app.get(CacheService);
        this.jwtGuard = new JwtGuard(this.config, this.userRepo, this.cache);
    }

    createIOServer(port: number, options?: ServerOptions) {
        const server: Server = super.createIOServer(port, options);
        const socketNamespace = this.config.get('SOCKET_NAMESPACE') ?? 'test';
        server.of(socketNamespace).use(async (socket: Socket, next: (err?: any) => void) => {
            const client = socket as TSocketInfo;
            const verifyClient = await this.jwtGuard.verifySocket(client);
            if (!verifyClient) return next(new ForbiddenException());
            return next();
        });
        return server;
    }
}
