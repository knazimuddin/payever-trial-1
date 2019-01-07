import { Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthModule } from '@pe/nest-kit/modules/auth';

import { environment } from './environments';
import { TransactionsModule } from './transactions/transactions.module';
import { StatusModule } from './status/status.module';

@Module({
  imports: [
    JwtAuthModule.forRoot(environment.jwtOptions),
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
