import { Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthModule } from '@pe/nest-kit/modules/auth';

import { environment } from './environments';
import { StatusModule } from './status/status.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    JwtAuthModule.forRoot(environment.jwtOptions),
    TransactionsModule,
    MongooseModule.forRoot(
      environment.mongodb,
      {
        useCreateIndex: true,
        useNewUrlParser: true,
      },
    ),
    StatusModule,
  ],
  providers: [
  ],
})
export class ApplicationModule implements NestModule {
  configure() {
  }
}
