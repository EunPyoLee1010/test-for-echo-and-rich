import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RouterModule } from '@nestjs/core';

const moduleList = [];

@Module({
    imports: [
        ...moduleList,
        RouterModule.register(
            moduleList.map((module) => ({
                path: '/user',
                module,
            }))
        ),
    ],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
