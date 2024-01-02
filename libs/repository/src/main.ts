import { Global, Module } from '@nestjs/common';
import { RDBMSConnectionManager } from './rdbms/manager';
import { EmployeeRepository } from './rdbms/employee/employee.repository';
import { JobHistoryRepository } from './rdbms/employee/job-history.repository';
import { DepartmentRepository } from './rdbms/employee/department.repository';

const repositoryList = [RDBMSConnectionManager, EmployeeRepository, JobHistoryRepository, DepartmentRepository];

@Global()
@Module({
    providers: repositoryList,
    exports: repositoryList,
})
export class RepositoryModule {}
