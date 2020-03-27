import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModelsNamesEnum, CommonSdkModule } from '@pe/common-sdk';
import { ElasticSearchModule } from '@pe/elastic-kit';
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
  TransactionsExportCommand,
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
import { 
  AuthEventsProducer,
  DailyReportTransactionMailerReportEventProducer, 
  PaymentMailEventProducer, 
  TransactionEventProducer,
} from './producer';
import { TransactionsNotifier } from './notifiers';
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
    DailyReportTransactionsService,
    DailyReportTransactionMailerReportEventProducer,
    DtoValidationService,
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
    TransactionsExportCommand,
    TransactionsService,
    TransactionsNotifier,
    PaymentMailEventProducer,
    TransactionEventProducer,
    ThirdPartyCallerService,
    ...EventListenersList,
  ],
})
export class TransactionsModule {}
