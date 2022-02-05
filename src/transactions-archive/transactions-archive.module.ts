import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { EventDispatcherModule, IntercomModule } from '@pe/nest-kit';
import { ElasticSearchModule } from '@pe/elastic-kit';
// import {
// } from './controllers';
import { BusinessEventListener } from './event-listeners';
import {
  TransactionsArchiveSchema,
  TransactionsArchiveSchemaName,
} from './schemas';
import {
  TransactionsArchiveService,
  TransactionsArchiveAccessService,
} from './services';
import { environment } from '../environments';

@Module({
  controllers: [
  ],
  imports: [
    ConfigModule,
    HttpModule,
    IntercomModule,
    MongooseModule.forFeature([
      { name: TransactionsArchiveSchemaName, schema: TransactionsArchiveSchema },
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
