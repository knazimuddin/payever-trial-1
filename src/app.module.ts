import { Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApmModule } from '@pe/nest-kit/modules/apm';
import { JwtAuthModule } from '@pe/nest-kit/modules/auth';
import { CommandModule } from 'nestjs-command';
import { NestKitLoggingModule } from '@pe/nest-kit/modules/logging';

import { environment } from './environments';
import { StatusModule } from './status/status.module';
import { TransactionsModule } from './transactions/transactions.module';
import {TransactionsEsSearch} from "./esTransactions/esTransactions.module";

@Module({
  imports: [
    NestKitLoggingModule.forRoot({
      isProduction: environment.production,
      applicationName: environment.applicationName,
    }),
    JwtAuthModule.forRoot(environment.jwtOptions),
    TransactionsModule,
    MongooseModule.forRoot(
      environment.mongodb,
      {
        useCreateIndex: true,
        useNewUrlParser: true,
      },
    ),
    StatusModule,
    TransactionsEsSearch,
    ApmModule.forRoot(
      environment.apm.enable,
      environment.apm.options,
    ),
    CommandModule,
  ],
  providers: [
  ],
})
export class ApplicationModule implements NestModule {
  public configure() {
  }
}
