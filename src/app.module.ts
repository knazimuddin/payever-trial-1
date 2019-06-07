import { Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApmModule, CommandModule, JwtAuthModule, RabbitMqModule } from '@pe/nest-kit';
import { NestKitLoggingModule } from '@pe/nest-kit/modules/logging';
import { StatusModule } from '@pe/nest-kit/modules/status';

import { environment } from './environments';
import { TransactionsEsSearch } from './esTransactions/esTransactions.module';
import { IntegrationModule } from './integration';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ApmModule.forRoot(
      environment.apm.enable,
      environment.apm.options,
    ),
    CommandModule,
    JwtAuthModule.forRoot(environment.jwtOptions),
    MongooseModule.forRoot(
      environment.mongodb,
      {
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: false,
      },
    ),
    NestKitLoggingModule.forRoot({
      isProduction: environment.production,
      applicationName: environment.applicationName,
    }),
    RabbitMqModule.forRoot(environment.rabbitmq),
    StatusModule.forRoot({
      sideAppPort: environment.statusPort,
    }),
    IntegrationModule,
    TransactionsModule,
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
export class AppModule implements NestModule {
  public configure() {}
}
