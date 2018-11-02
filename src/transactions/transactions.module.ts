import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessController, DevController, MicroEventsController, MigrateEventsController } from './controllers';
import { TransactionsService, TransactionsGridService, StubService, MessagingService } from './services';
import { TransactionsSchema } from './schemas/transaction.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: 'TransactionsSchema', schema: TransactionsSchema }]),
  ],
  controllers: [
    BusinessController,
    DevController,
    MicroEventsController,
    MigrateEventsController,
  ],
  providers: [
    TransactionsService,
    TransactionsGridService,
    StubService,
    MessagingService,
  ],
})
export class TransactionsModule {}
