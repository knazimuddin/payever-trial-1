import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsSdkModule } from '@pe/notifications-sdk';
import { TransactionsEsExportCommand } from './command/transactions-export-to-es.command';
import { TransactionsExportCommand } from './command/transactions-export.command';

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
import { CommonModelsNamesEnum, CommonSdkModule } from '@pe/common-sdk';
import { environment } from '../environments';
import { HistoryRecordEmitterConsumer } from './emitter/history-record-emitter.consumer';
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
    NestEmitterModule,
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
