import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApmModule, CommandModule, JwtAuthModule, RabbitMqModule } from '@pe/nest-kit';
import { NestKitLoggingModule } from '@pe/nest-kit/modules/logging';
import { MutexModule } from '@pe/nest-kit/modules/mutex';
import { StatusModule } from '@pe/nest-kit/modules/status';
import { environment } from './environments';
import { IntegrationModule } from './integration';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ApmModule.forRoot(
      environment.apm.enable,
      environment.apm.options,
    ),
    CommandModule,
    JwtAuthModule.forRoot(environment.jwtOptions, environment.redis),
    MongooseModule.forRoot(
      environment.mongodb,
      {
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    ),
    NestKitLoggingModule.forRoot({
      applicationName: environment.applicationName,
      isProduction: environment.production,
    }),
    RabbitMqModule.forRoot(environment.rabbitmq),
    StatusModule.forRoot({
      sideAppPort: environment.statusPort,
    }),
    MutexModule.forRoot(environment.redis),
    IntegrationModule,
    TransactionsModule,
  ],
  providers: [
  ],
})
export class AppModule implements NestModule {
  public configure(): MiddlewareConsumer | void {}
}
