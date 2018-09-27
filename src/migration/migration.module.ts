import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';

import { MigrationController } from './controllers';
import { MigrationService, TransactionsService } from './services';
import { TransactionsModule } from '../transactions/transactions.module';
import { TransactionsSchema } from '../transactions/schemas/transaction.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    MongooseModule.forFeature([{ name: 'TransactionsSchema', schema: TransactionsSchema }]),
    TransactionsModule,
  ],
  controllers: [MigrationController],
  providers: [
    MigrationService,
    TransactionsService,
  ],
})
export class MigrationModule {}
