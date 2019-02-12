import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  BusinessController,
  DevController,
  MicroEventsController,
  MigrateEventsController,
  UserController
} from './controllers';
import {
  BusinessPaymentOptionService,
  MessagingService,
  PaymentFlowService,
  StubService,
  TransactionsGridService,
  TransactionsService,
  DtoValidationService,
} from './services';
import { TransactionsSchema, PaymentFlowSchema, BusinessPaymentOptionSchema } from './schemas';
import { StatisticsService } from './services/statistics.service';
import { TransactionMapper } from './mappers';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: 'TransactionsSchema', schema: TransactionsSchema }]),
    MongooseModule.forFeature([{ name: 'BusinessPaymentOptionSchema', schema: BusinessPaymentOptionSchema }]),
    MongooseModule.forFeature([{ name: 'PaymentFlowSchema', schema: PaymentFlowSchema }]),
  ],
  controllers: [
    BusinessController,
    DevController,
    MicroEventsController,
    MigrateEventsController,
    UserController
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
    TransactionMapper,
  ],
})
export class TransactionsModule {}
