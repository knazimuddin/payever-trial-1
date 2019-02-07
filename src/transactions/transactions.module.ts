import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsSdkModule } from '@pe/notifications-sdk';

import { BusinessController, DevController, MicroEventsController, MigrateEventsController } from './controllers';
import {
  BusinessPaymentOptionService,
  MessagingService,
  PaymentFlowService,
  StubService,
  TransactionsGridService,
  TransactionsService,
} from './services';
import { TransactionsSchema, PaymentFlowSchema, BusinessPaymentOptionSchema } from './schemas';
import { StatisticsService } from './services/statistics.service';
import {environment} from '../environments';

@Module({
  imports: [
    HttpModule,
    NotificationsSdkModule.forRoot({
      rabbitMqOptions: environment.rabbitmq,
    }),
    MongooseModule.forFeature([{ name: 'TransactionsSchema', schema: TransactionsSchema }]),
    MongooseModule.forFeature([{ name: 'BusinessPaymentOptionSchema', schema: BusinessPaymentOptionSchema }]),
    MongooseModule.forFeature([{ name: 'PaymentFlowSchema', schema: PaymentFlowSchema }]),
  ],
  controllers: [
    BusinessController,
    DevController,
    MicroEventsController,
    MigrateEventsController,
  ],
  providers: [
    BusinessPaymentOptionService,
    MessagingService,
    PaymentFlowService,
    StubService,
    TransactionsGridService,
    TransactionsService,
    StatisticsService,
  ],
})
export class TransactionsModule {}
