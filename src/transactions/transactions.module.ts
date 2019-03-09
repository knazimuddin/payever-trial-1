import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsSdkModule } from '@pe/notifications-sdk';
import { environment } from '../environments';
import { TransactionsExportCommand } from './command/transactions-export.command';

import {
  AdminController,
  BusinessController,
  DevController,
  MicroEventsController,
  MigrateEventsController,
  UserController,
} from './controllers';
import { BusinessPaymentOptionSchema, PaymentFlowSchema, TransactionsSchema } from './schemas';
import {
  BusinessPaymentOptionService,
  DtoValidationService,
  MessagingService,
  PaymentFlowService,
  StubService,
  TransactionsGridService,
  TransactionsService,
  CurrencyExchangeService,
} from './services';
import { StatisticsService } from './services/statistics.service';

@Module({
  imports: [
    HttpModule,
    NotificationsSdkModule.forRoot({
      rabbitMqOptions: environment.rabbitmq,
    }),
    MongooseModule.forFeature([{ name: 'Transaction', schema: TransactionsSchema }]),
    MongooseModule.forFeature([{ name: 'BusinessPaymentOption', schema: BusinessPaymentOptionSchema }]),
    MongooseModule.forFeature([{ name: 'PaymentFlow', schema: PaymentFlowSchema }]),
  ],
  controllers: [
    BusinessController,
    DevController,
    MicroEventsController,
    MigrateEventsController,
    UserController,
    AdminController,
  ],
  providers: [
    BusinessPaymentOptionService,
    MessagingService,
    PaymentFlowService,
    StubService,
    TransactionsGridService,
    TransactionsService,
    StatisticsService,
    DtoValidationService,
    TransactionsExportCommand,
    CurrencyExchangeService,
  ],
})
export class TransactionsModule {}
