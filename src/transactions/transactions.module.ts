import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModelsNamesEnum, CommonSdkModule } from '@pe/common-sdk';
import { NotificationsSdkModule } from '@pe/notifications-sdk';
import { environment } from '../environments';
import {
  BpoFixCommand,
  TransactionsEsBusinessUpdateCommand,
  TransactionsEsCompareCommand,
  TransactionsEsExportCommand,
  TransactionsEsSetupCommand,
  TransactionsExportCommand,
} from './commands';
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
  BusinessPaymentOptionSchema,
  BusinessPaymentOptionSchemaName,
  BusinessSchema,
  BusinessSchemaName,
  PaymentFlowSchema,
  PaymentFlowSchemaName,
  TransactionExampleSchema,
  TransactionExampleSchemaName,
  TransactionSchema,
  TransactionSchemaName,
} from './schemas';
import {
  ActionsRetriever,
  BusinessPaymentOptionService,
  BusinessService,
  CurrencyExchangeService,
  DtoValidationService,
  ElasticSearchService,
  MessagingService,
  MongoSearchService,
  PaymentFlowService,
  PaymentsMicroService,
  StatisticsService,
  TransactionHistoryService,
  TransactionsExampleService,
  TransactionsService,
} from './services';

@Module({
  controllers: [
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
  ],
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: BusinessPaymentOptionSchemaName, schema: BusinessPaymentOptionSchema },
      { name: TransactionExampleSchemaName, schema: TransactionExampleSchema },
      { name: PaymentFlowSchemaName, schema: PaymentFlowSchema },
      { name: TransactionSchemaName, schema: TransactionSchema },
      { name: BusinessSchemaName, schema: BusinessSchema },
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
    BpoFixCommand,
    BusinessPaymentOptionService,
    BusinessService,
    CurrencyExchangeService,
    DtoValidationService,
    ElasticSearchClient,
    ElasticSearchService,
    MessagingService,
    MongoSearchService,
    PaymentFlowService,
    PaymentMailEventProducer,
    PaymentsMicroService,
    StatisticsService,
    TransactionHistoryService,
    TransactionsEsCompareCommand,
    TransactionsEsExportCommand,
    TransactionsEsSetupCommand,
    TransactionsEsBusinessUpdateCommand,
    TransactionsExampleService,
    TransactionsExportCommand,
    TransactionsService,
  ],
})
export class TransactionsModule {}
