import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { environment } from './environments';

import { MigrationModule } from './migration/migration.module';

@Module({
  imports: [
    MigrationModule,
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
})
export class MigrationAppModule implements NestModule {
  configure() {
  }
}
