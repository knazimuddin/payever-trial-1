import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModelsNamesEnum, CommonSdkModule } from '@pe/common-sdk';
import { NotificationsSdkModule } from '@pe/notifications-sdk';
import { environment } from '../environments';
import { TransactionsEsExportCommand } from './command/transactions-export-to-es.command';
import { TransactionsExportCommand } from './command/transactions-export.command';
import { TransactionsFieldMappingSetupCommand } from './command/transactions-field-mapping-setup.command';
import {
  AdminController,
  BpoEventsController,
  BusinessBusMessagesController,
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
  BusinessCurrencySchema,
  BusinessCurrencySchemaName,
  BusinessPaymentOptionSchema,
  BusinessPaymentOptionSchemaName,
  PaymentFlowSchema,
  PaymentFlowSchemaName,
  TransactionSchema,
  TransactionSchemaName,
} from './schemas';
import {
  ActionsRetriever,
  BusinessCurrencyService,
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
    BusinessBusMessagesController,
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
      { name: BusinessCurrencySchemaName, schema: BusinessCurrencySchema },
    ]),
    NotificationsSdkModule,
    CommonSdkModule.forRoot({
      consumerModels: [
        CommonModelsNamesEnum.CurrencyModel,
      ],
      rsaPath: environment.rsa,
    }),
  ],
  providers: [
    ActionsRetriever,
    BusinessPaymentOptionService,
    BusinessCurrencyService,
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
    TransactionsFieldMappingSetupCommand,
    TransactionsService,
    PaymentMailEventProducer,
  ],
})
export class TransactionsModule {}
