import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessController, DevController } from './controllers';
import { TransactionsService, TransactionsListService, StubService } from './services';
import { TransactionsSchema } from './schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'TransactionsSchema', schema: TransactionsSchema }]),
  ],
  controllers: [BusinessController, DevController],
  providers: [
    TransactionsService,
    TransactionsListService,
    StubService,
  ],
})
export class TransactionsModule {}
