import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';

import { BusinessController, DevController } from './controllers';
import { TransactionsService, TransactionsListService, StubService } from './services';
import { TransactionsSchema } from './schemas/transaction.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
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
