import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsSdkModule } from '@pe/notifications-sdk';

import { TransactionsEsExportCommand } from './command/transactions-export-to-es.command';
import { TransactionsExportCommand } from './command/transactions-export.command';
import {
  AdminController,
  BusinessController,
  DevController,
  MicroEventsController,
  MigrateEventsController,
  UserController,
} from './controllers';
import { BusinessPaymentOptionSchema, PaymentFlowSchema, TransactionsSchema } from './schemas';
import {
  BusinessPaymentOptionService,
  CurrencyExchangeService,
  DtoValidationService,
  MessagingService,
  PaymentFlowService,
  PaymentsMicroService,
  StubService,
  TransactionsGridService,
  TransactionsService,
} from './services';
import { StatisticsService } from './services/statistics.service';

@Module({
  imports: [
    HttpModule,
    NotificationsSdkModule,
    MongooseModule.forFeature([{ name: 'Transaction', schema: TransactionsSchema }]),
    MongooseModule.forFeature([{ name: 'BusinessPaymentOption', schema: BusinessPaymentOptionSchema }]),
    MongooseModule.forFeature([{ name: 'PaymentFlow', schema: PaymentFlowSchema }]),
  ],
  controllers: [
    BusinessController,
    DevController,
    MicroEventsController,
    MigrateEventsController,
    UserController,
    AdminController,
  ],
  providers: [
    BusinessPaymentOptionService,
    MessagingService,
    PaymentFlowService,
    StubService,
    TransactionsGridService,
    TransactionsService,
    StatisticsService,
    DtoValidationService,
    TransactionsExportCommand,
    TransactionsEsExportCommand,
    CurrencyExchangeService,
    PaymentsMicroService,
  ],
})
export class TransactionsModule {}
