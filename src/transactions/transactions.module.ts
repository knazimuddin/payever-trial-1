import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsSdkModule } from '@pe/notifications-sdk';
import { TransactionsEsExportCommand } from './command/transactions-export-to-es.command';
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
  CurrencyExchangeService,
  DtoValidationService,
  MessagingService,
  PaymentFlowService,
  PaymentsMicroService,
  StatisticsService,
  StubService,
  TransactionsGridService,
  TransactionsService,
} from './services';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: 'BusinessPaymentOption', schema: BusinessPaymentOptionSchema },
      { name: 'PaymentFlow', schema: PaymentFlowSchema },
      { name: 'Transaction', schema: TransactionsSchema },
    ]),
    NotificationsSdkModule,
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
    TransactionsEsExportCommand,
    CurrencyExchangeService,
    PaymentsMicroService,
  ],
})
export class TransactionsModule {}
