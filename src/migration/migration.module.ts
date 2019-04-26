import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionSchema, TransactionSchemaName } from '../transactions/schemas';
import { TransactionsModule } from '../transactions/transactions.module';
import { MigrationController } from './controllers';
import { Transaction } from './entities';
import { MigrationService, TransactionsService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    MongooseModule.forFeature([{ name: TransactionSchemaName, schema: TransactionSchema }]),
    TransactionsModule,
  ],
  controllers: [MigrationController],
  providers: [
    MigrationService,
    TransactionsService,
  ],
})
export class MigrationModule {}
