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
import { ElasticSearchClient } from './elasticsearch/elastic-search.client';
import { PaymentMailEventProducer } from './producer';
import {
  BusinessPaymentOptionSchema,
  BusinessPaymentOptionSchemaName,
  PaymentFlowSchema,
  PaymentFlowSchemaName,
  TransactionSchema,
  TransactionSchemaName,
} from './schemas';
import {
  BusinessPaymentOptionService,
  CurrencyExchangeService,
  DtoValidationService,
  ElasticSearchService,
  MessagingService,
  MongoSearchService,
  PaymentFlowService,
  PaymentsMicroService,
  StatisticsService,
  TransactionHistoryService,
  TransactionsService,
} from './services';

@Module({
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
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: BusinessPaymentOptionSchemaName, schema: BusinessPaymentOptionSchema },
      { name: PaymentFlowSchemaName, schema: PaymentFlowSchema },
      { name: TransactionSchemaName, schema: TransactionSchema },
    ]),
    NotificationsSdkModule,
  ],
  providers: [
    BusinessPaymentOptionService,
    CurrencyExchangeService,
    DtoValidationService,
    MessagingService,
    MongoSearchService,
    ElasticSearchClient,
    ElasticSearchService,
    PaymentFlowService,
    PaymentsMicroService,
    StatisticsService,
    TransactionHistoryService,
    TransactionsEsExportCommand,
    TransactionsExportCommand,
    TransactionsService,
    PaymentMailEventProducer,
  ],
})
export class TransactionsModule {}
