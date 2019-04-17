import { Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApmModule, CommandModule, JwtAuthModule, RabbitMqModule } from '@pe/nest-kit';
import { NestKitLoggingModule } from '@pe/nest-kit/modules/logging';
import { StatusModule } from '@pe/nest-kit/modules/status';

import { environment } from './environments';
import { TransactionsEsSearch } from './esTransactions/esTransactions.module';
import { TransactionsModule } from './transactions/transactions.module';

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
    StatusModule.forRoot({
      sideAppPort: environment.statusPort,
    }),
    TransactionsEsSearch,
    ApmModule.forRoot(
      environment.apm.enable,
      environment.apm.options,
    ),
    CommandModule,
    RabbitMqModule.forRoot(environment.rabbitmq),
  ],
  providers: [
  ],
})
export class ApplicationModule implements NestModule {
  public configure() {
  }
}
