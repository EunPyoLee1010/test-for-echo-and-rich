import { Global, Module } from '@nestjs/common';
import { RDBMSConnectionManager } from './rdbms/manager';
import { UserRepository } from './rdbms/user/user.repository';
import { LogRepository } from './rdbms/log/log.repository';

const repositoryList = [RDBMSConnectionManager, UserRepository, LogRepository];

@Global()
@Module({
    providers: repositoryList,
    exports: repositoryList,
})
export class RepositoryModule {}
