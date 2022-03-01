import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { EventDispatcherModule, IntercomModule } from '@pe/nest-kit';
import { ElasticSearchModule } from '@pe/elastic-kit';
import { BusinessEventListener } from './event-listeners';
import {
  TransactionsArchiveSchema,
  TransactionsArchiveSchemaName,
  TransactionsArchiveAccessSchemaName,
  TransactionsArchiveAccessSchema,
} from './schemas';
import {
  TransactionsArchiveService,
  TransactionsArchiveAccessService,
} from './services';
import { environment } from '../environments';

@Module({
  controllers: [
  ],
  exports: [
    TransactionsArchiveService,
  ],
  imports: [
    ConfigModule,
    HttpModule,
    IntercomModule,
    MongooseModule.forFeature([
      {
        name: TransactionsArchiveAccessSchemaName,
        schema: TransactionsArchiveAccessSchema,
      },
      {
        name: TransactionsArchiveSchemaName,
        schema: TransactionsArchiveSchema,
      },
    ]),
    EventDispatcherModule,
    ElasticSearchModule.forRoot({
      authPassword: environment.elasticSearchAuthPassword,
      authUsername: environment.elasticSearchAuthUsername,
      cloudId: environment.elasticSearchCloudId,
      host: environment.elasticSearchHost,
    }),
  ],
  providers: [
    // Listeners
    BusinessEventListener,
    // Services
    TransactionsArchiveService,
    TransactionsArchiveAccessService,
  ],
})
export class TransactionsArchiveModule { }
