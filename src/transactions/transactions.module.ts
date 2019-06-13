import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsSdkModule } from '@pe/notifications-sdk';
import { TransactionsEsExportCommand } from './command/transactions-export-to-es.command';
import { TransactionsExportCommand } from './command/transactions-export.command';

import {
  AdminController,
  BpoEventsController,
  BusinessController,
  FlowEventsController,
  HistoryEventsController,
  MigrateEventsController,
  ThirdPartyEventsController,
  TransactionEventsController,
  UserController,
} from './controllers';
import {
  BusinessPaymentOptionSchema,
  BusinessPaymentOptionSchemaName,
  PaymentFlowSchema,
  PaymentFlowSchemaName,
  TransactionSchema,
  TransactionSchemaName,
} from './schemas';
import {
  ActionsRetriever,
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
      { name: BusinessPaymentOptionSchemaName, schema: BusinessPaymentOptionSchema },
      { name: PaymentFlowSchemaName, schema: PaymentFlowSchema },
      { name: TransactionSchemaName, schema: TransactionSchema },
    ]),
    NotificationsSdkModule,
  ],
  controllers: [
    AdminController,
    BpoEventsController,
    BusinessController,
    FlowEventsController,
    HistoryEventsController,
    MigrateEventsController,
    TransactionEventsController,
    UserController,
    ThirdPartyEventsController,
  ],
  providers: [
    ActionsRetriever,
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
