import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { EventDispatcherModule, IntercomModule } from '@pe/nest-kit';
import { ElasticSearchModule } from '@pe/elastic-kit';
import { ArchivedTransactionEventListener, BusinessEventListener } from './event-listeners';
import {
  ArchivedTransactionSchema,
  ArchivedTransactionSchemaName,
  TransactionsArchiveAccessSchemaName,
  TransactionsArchiveAccessSchema,
} from './schemas';
import {
  ArchivedTransactionService,
  ArchivedTransactionAccessService,
} from './services';
import { environment } from '../environments';

@Module({
  controllers: [
  ],
  exports: [
    ArchivedTransactionService,
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
        name: ArchivedTransactionSchemaName,
        schema: ArchivedTransactionSchema,
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
    ArchivedTransactionEventListener,
    BusinessEventListener,
    // Services
    ArchivedTransactionService,
    ArchivedTransactionAccessService,
  ],
})
export class TransactionsArchiveModule { }
