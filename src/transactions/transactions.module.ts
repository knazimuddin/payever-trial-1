import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModelsNamesEnum, CommonSdkModule } from '@pe/common-sdk';
import { NotificationsSdkModule } from '@pe/notifications-sdk';
import { environment } from '../environments';
import {
  BpoFixCommand,
  TransactionsEsExportCommand,
  TransactionsExportCommand,
  TransactionsFieldMappingSetupCommand,
} from './commands';
import {
  AdminController,
  BpoEventsController,
  BusinessBusMessagesController,
  BusinessController,
  FlowEventsController,
  HistoryEventsController,
  MigrateEventsController,
  ShippingBusMessagesController,
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
import { NestEmitterModule } from '@pe/nest-kit';
import { AbstractConsumer, EmitterConsumerInitializer } from './emitter';
import { EventEmiterConsumers } from './enum';

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
    ShippingBusMessagesController,
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
    NestEmitterModule,
  ],
  providers: [
    ActionsRetriever,
    BpoFixCommand,
    BusinessPaymentOptionService,
    BusinessService,
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
    TransactionsExampleService,
    TransactionsExportCommand,
    TransactionsFieldMappingSetupCommand,
    TransactionsService,
    PaymentMailEventProducer,
    ...EventEmiterConsumers,
    EmitterConsumerInitializer,
    {
      inject: [...EventEmiterConsumers],
      provide: EmitterConsumerInitializer,
      useFactory: (...emitterConsumers: AbstractConsumer[]): EmitterConsumerInitializer => {
        const initializer: EmitterConsumerInitializer = new EmitterConsumerInitializer();
        emitterConsumers.forEach((consumer: AbstractConsumer) => initializer.addConsumer(consumer));

        return initializer;
      },
    },
  ],
})
export class TransactionsModule {}
