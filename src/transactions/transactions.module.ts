import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModelsNamesEnum, CommonSdkModule } from '@pe/common-sdk';
import { DelayRemoveClient, ElasticSearchModule } from '@pe/elastic-kit';
import { EventDispatcherModule, IntercomModule } from '@pe/nest-kit';
import { NotificationsSdkModule } from '@pe/notifications-sdk';
import { environment } from '../environments';
import {
  BpoFixCommand,
  TransactionsEsBusinessCheckCommand,
  TransactionsEsBusinessUpdateCommand,
  TransactionsEsCompareCommand,
  TransactionsEsExportCommand,
  TransactionsEsSetupCommand,
  TransactionsExportForWidgetsCommand,
  TransactionsExportForBlankMigrateCommand,
} from './commands';
import {
  AdminController,
  AuthEventsController,
  BpoEventsController,
  BusinessBusMessagesController,
  BusinessController,
  DailyReportTransactionBusMessagesController,
  FlowEventsController,
  HistoryEventsController,
  MailerBusMessagesController,
  MigrateEventsController,
  ShippingBusMessagesController,
  ThirdPartyEventsController,
  TransactionEventsController,
  UserController,
} from './controllers';
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
} from './schemas';
import {
  ActionsRetriever,
  BusinessPaymentOptionService,
  BusinessService,
  CurrencyExchangeService,
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
} from './services';

@Module({
  controllers: [
    AdminController,
    BpoEventsController,
    BusinessBusMessagesController,
    BusinessController,
    DailyReportTransactionBusMessagesController,
    FlowEventsController,
    HistoryEventsController,
    MigrateEventsController,
    ThirdPartyEventsController,
    TransactionEventsController,
    UserController,
    ShippingBusMessagesController,
    MailerBusMessagesController,
    AuthEventsController,
  ],
  imports: [
    ConfigModule,
    HttpModule,
    IntercomModule,
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
    EventDispatcherModule,
    ElasticSearchModule.forRoot({
      host: environment.elasticSearch,
    }),
  ],
  providers: [
    ActionsRetriever,
    BpoFixCommand,
    BusinessPaymentOptionService,
    BusinessService,
    CurrencyExchangeService,
    ConfigService,
    DailyReportTransactionsService,
    DailyReportTransactionMailerReportEventProducer,
    DtoValidationService,
    DelayRemoveClient,
    ElasticSearchService,
    MessagingService,
    MongoSearchService,
    PaymentFlowService,
    PaymentMailEventProducer,
    PaymentsMicroService,
    StatisticsService,
    TransactionActionService,
    TransactionHistoryService,
    TransactionsEsBusinessCheckCommand,
    TransactionsEsBusinessUpdateCommand,
    TransactionsEsCompareCommand,
    TransactionsEsExportCommand,
    TransactionsEsSetupCommand,
    AuthEventsProducer,
    TransactionsExampleService,
    TransactionsExportForWidgetsCommand,
    TransactionsExportForBlankMigrateCommand,
    TransactionsService,
    TransactionsNotifier,
    PaymentMailEventProducer,
    TransactionEventProducer,
    ThirdPartyCallerService,
    ...EventListenersList,
  ],
})
export class TransactionsModule { }
