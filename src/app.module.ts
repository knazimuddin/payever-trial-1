import { MiddlewareConsumer, Module, NestModule, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ApmModule,
  CommandModule,
  DefaultMongooseConfig,
  JwtAuthModule,
  RabbitMqModule,
  RedisModule,
} from '@pe/nest-kit';
import { NestKitLoggingModule } from '@pe/nest-kit/modules/logging';
import { MutexModule } from '@pe/nest-kit/modules/mutex';
import { StatusModule } from '@pe/nest-kit/modules/status';
import { environment } from './environments';
import { IntegrationModule } from './integration';
import { TransactionsModule } from './transactions/transactions.module';
import { TranslationService } from './transactions/services/translation.service';

@Module({
  imports: [
    ApmModule.forRoot(
      environment.apm.enable,
      environment.apm.options,
    ),
    CommandModule,
    JwtAuthModule.forRoot(environment.jwtOptions),
    RedisModule.forRoot(environment.redis),
    MongooseModule.forRoot(
      environment.mongodb,
      DefaultMongooseConfig,
    ),
    NestKitLoggingModule.forRoot({
      applicationName: environment.applicationName,
      isProduction: environment.production,
    }),
    RabbitMqModule.forRoot(environment.rabbitmq),
    StatusModule.forRoot({
      sideAppPort: environment.statusPort,
    }),
    MutexModule,
    IntegrationModule,
    TransactionsModule,
    HttpModule
  ],
  providers: [TranslationService],
})
export class AppModule implements NestModule {
  public configure(): MiddlewareConsumer | void { }
}
