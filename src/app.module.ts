import { Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { environment } from './environments';

import { TransactionsModule } from './transactions/transactions.module';
import { StatusModule } from './status/status.module';

@Module({
  imports: [
    TransactionsModule,
    MongooseModule.forRoot(environment.mongodb),
    StatusModule,
  ],
  providers: [
  ],
})
export class ApplicationModule implements NestModule {
  configure() {
  }
}
