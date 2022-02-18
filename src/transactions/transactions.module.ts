import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModelsNamesEnum, CommonSdkModule } from '@pe/common-sdk';
import { DelayRemoveClient, ElasticSearchModule } from '@pe/elastic-kit';
import { CollectorModule, EventDispatcherModule, IntercomModule } from '@pe/nest-kit';
import { NotificationsSdkModule } from '@pe/notifications-sdk';
import { MigrationModule } from '@pe/migration-kit';
import { FoldersPluginModule } from '@pe/folders-plugin';
import { RulesSdkModule } from '@pe/rules-sdk';
import { BusinessModule } from '@pe/business-kit';

import { environment } from '../environments';
import {
  BpoFixCommand,
  ExportTransactionToWidgetCommand,
  FolderDocumentsTransactionsEsBusinessUpdateCommand,
  TransactionsEsBusinessCheckCommand,
  TransactionsEsBusinessUpdateCommand,
  TransactionsEsCompareCommand,
  TransactionsEsExportCommand,
  TransactionsEsFixDiffCommand,
  TransactionsEsSetupCommand,
  TransactionsExportForBlankMigrateCommand,
  TransactionsExportForWidgetsCommand,
  TriggerPayexCaptureCommand,
} from './commands';
import {
  AdminController,
  AuthEventsController,
  BpoEventsController,
  BusinessController,
  DailyReportTransactionBusMessagesController,
  FlowEventsController,
  HistoryEventsController,
  MailerBusMessagesController,
  MigrateEventsController,
  LegacyApiController,
  SampleProductsBusMessagesController,
  ShippingBusMessagesController,
  ThirdPartyEventsController,
  TransactionEventsController,
  UserController,
  InternalTransactionEventsController,
  ProxyController,
  ExportTransactionsController,
  ExportTransactionsBusMessagesController,
} from './controllers';
import { ExchangeCalculatorFactory } from './currency';
import { EventListenersList } from './event-listeners/event-listeners.list';
import { TransactionsNotifier } from './notifiers';
import {
  AuthEventsProducer,
  DailyReportTransactionMailerReportEventProducer,
  PaymentMailEventProducer,
  TransactionEventProducer,
} from './producer';
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
  SampleProductSchema,
  SampleProductSchemaName,
} from './schemas';
import {
  ActionsRetriever,
  BusinessPaymentOptionService,
  DailyReportTransactionsService,
  DtoValidationService,
  ElasticSearchService,
  MessagingService,
  MongoSearchService,
  PaymentFlowService,
  PaymentsMicroService,
  StatisticsService,
  ThirdPartyCallerService,
  TransactionActionService,
  TransactionHistoryService,
  TransactionsExampleService,
  TransactionsService,
  SampleProductsService,
  ExportMonthlyBusinessTransactionService,
  ExportUserPerBusinessTransactionService,
  ActionValidatorsList,
  TransactionsInfoService,
  ExporterService,
} from './services';
import { EventsGateway } from './ws';
import { RabbitChannels } from '../enums';
import { FiltersConfig, FoldersConfig, RulesOptions } from '../config';
import { ExportMonthlyBusinessTransactionCronService } from '../cron/export-monthly-business-transaction.cron.service';

@Module({
  controllers: [
    AdminController,
    BpoEventsController,
    BusinessController,
    DailyReportTransactionBusMessagesController,
    FlowEventsController,
    HistoryEventsController,
    MigrateEventsController,
    LegacyApiController,
    ThirdPartyEventsController,
    TransactionEventsController,
    UserController,
    ShippingBusMessagesController,
    MailerBusMessagesController,
    AuthEventsController,
    SampleProductsBusMessagesController,
    InternalTransactionEventsController,
    ProxyController,
    ExportTransactionsController,
    ExportTransactionsBusMessagesController,
  ],
  imports: [
    ConfigModule,
    HttpModule,
    IntercomModule,
    BusinessModule.forRoot(
      {
        customSchema: BusinessSchema,
        rabbitChannel: RabbitChannels.Transactions,
    }),
    MongooseModule.forFeature([
      { name: BusinessPaymentOptionSchemaName, schema: BusinessPaymentOptionSchema },
      { name: TransactionExampleSchemaName, schema: TransactionExampleSchema },
      { name: PaymentFlowSchemaName, schema: PaymentFlowSchema },
      { name: TransactionSchemaName, schema: TransactionSchema },
      { name: BusinessSchemaName, schema: BusinessSchema },
      { name: SampleProductSchemaName, schema: SampleProductSchema },
    ]),
    NotificationsSdkModule,
    CommonSdkModule.forRoot({
      channel: RabbitChannels.Transactions,
      consumerModels: [
        CommonModelsNamesEnum.CurrencyModel,
      ],
      filters: FiltersConfig,
      rsaPath: environment.rsa,
    }),
    EventDispatcherModule,
    ElasticSearchModule.forRoot({
      authPassword: environment.elasticSearchAuthPassword,
      authUsername: environment.elasticSearchAuthUsername,
      cloudId: environment.elasticSearchCloudId,
      host: environment.elasticSearchHost,
    }),
    MigrationModule,
    FoldersPluginModule.forFeature(FoldersConfig),
    RulesSdkModule.forRoot(RulesOptions),
  ],
  providers: [
    ActionsRetriever,
    AuthEventsProducer,
    BpoFixCommand,
    BusinessPaymentOptionService,
    CollectorModule,
    ConfigService,
    DailyReportTransactionMailerReportEventProducer,
    DailyReportTransactionsService,
    DelayRemoveClient,
    DtoValidationService,
    ElasticSearchService,
    ExchangeCalculatorFactory,
    ExportTransactionToWidgetCommand,
    MessagingService,
    MongoSearchService,
    PaymentFlowService,
    PaymentMailEventProducer,
    PaymentMailEventProducer,
    PaymentsMicroService,
    StatisticsService,
    SampleProductsService,
    ThirdPartyCallerService,
    TransactionActionService,
    TransactionEventProducer,
    TransactionHistoryService,
    TransactionsEsBusinessCheckCommand,
    TransactionsEsBusinessUpdateCommand,
    FolderDocumentsTransactionsEsBusinessUpdateCommand,
    TransactionsEsCompareCommand,
    TransactionsEsExportCommand,
    TransactionsEsFixDiffCommand,
    TransactionsEsSetupCommand,
    TransactionsExampleService,
    TransactionsExportForBlankMigrateCommand,
    TransactionsExportForWidgetsCommand,
    TransactionsNotifier,
    TransactionsService,
    TriggerPayexCaptureCommand,
    ...EventListenersList,
    EventsGateway,
    ExportMonthlyBusinessTransactionService,
    ExportUserPerBusinessTransactionService,
    ...ActionValidatorsList,
    TransactionsInfoService,
    ExportMonthlyBusinessTransactionCronService,
    ExporterService,
  ],
})
export class TransactionsModule { }
