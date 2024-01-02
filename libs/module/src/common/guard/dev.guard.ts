import { CanActivate, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class DevGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) {}
    canActivate(): boolean | Promise<boolean> | Observable<boolean> {
        const nodeEnv = this.configService.get('NODE_ENV');
        return nodeEnv === 'development';
    }
}
