import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsSdkModule } from '@pe/notifications-sdk';
import { TransactionsEsExportCommand } from './command/transactions-export-to-es.command';
import { TransactionsExportCommand } from './command/transactions-export.command';

import {
  AdminController,
  BpoEventsController,
  BusinessController,
  DevController,
  FlowEventsController,
  HistoryEventsController,
  MigrateEventsController,
  TransactionEventsController,
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
  TransactionHistoryService,
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
    AdminController,
    BpoEventsController,
    BusinessController,
    DevController,
    FlowEventsController,
    HistoryEventsController,
    MigrateEventsController,
    TransactionEventsController,
    UserController,
  ],
  providers: [
    BusinessPaymentOptionService,
    CurrencyExchangeService,
    DtoValidationService,
    MessagingService,
    PaymentFlowService,
    PaymentsMicroService,
    StatisticsService,
    StubService,
    TransactionHistoryService,
    TransactionsEsExportCommand,
    TransactionsExportCommand,
    TransactionsGridService,
    TransactionsService,
  ],
})
export class TransactionsModule {}
