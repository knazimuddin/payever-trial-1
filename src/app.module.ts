import { Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMqModule } from '@pe/nest-kit';
import { ApmModule } from '@pe/nest-kit/modules/apm';
import { JwtAuthModule } from '@pe/nest-kit/modules/auth';
import { CommandModule } from 'nestjs-command';

import { environment } from './environments';
import { StatusModule } from './status/status.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
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
  public configure() {}
}
