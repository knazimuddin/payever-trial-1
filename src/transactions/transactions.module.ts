import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModelsNamesEnum, CommonSdkModule } from '@pe/common-sdk';
import { ElasticsearchModule, EventDispatcherModule } from '@pe/nest-kit';
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
  BpoEventsController,
  BusinessBusMessagesController,
  BusinessController, DevicePaymentsController,
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
import { PaymentMailEventProducer, TransactionEventsProducer } from './producer';
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
  TransactionActionService,
  TransactionHistoryService,
  TransactionsExampleService,
  TransactionsService,
} from './services';
import { TransactionsNotifier } from './notifiers';

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
    ShippingBusMessagesController,
    MailerBusMessagesController,
    DevicePaymentsController,
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
    EventDispatcherModule,
    ElasticsearchModule.forRoot({
      host: environment.elasticSearch,
    }),
  ],
  providers: [
    ActionsRetriever,
    BpoFixCommand,
    BusinessPaymentOptionService,
    BusinessService,
    CurrencyExchangeService,
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
    TransactionEventsProducer,
    TransactionsExampleService,
    TransactionsExportCommand,
    TransactionsService,
    TransactionsNotifier,
    PaymentMailEventProducer,
    ...EventListenersList,
  ],
})
export class TransactionsModule {}
