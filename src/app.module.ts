import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { environment } from './environments';

import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    TransactionsModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: environment.mysql.host,
      port: environment.mysql.port,
      username: environment.mysql.username,
      password: environment.mysql.password,
      database: environment.mysql.database,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),
    MongooseModule.forRoot(environment.mongodb),
  ],
  providers: [
    {
      provide: 'MICRO_URL_MAP',
      useValue: '???',
    },
  ],
})
export class ApplicationModule implements NestModule {
  configure() {
  }
}
