import { TestingModuleBuilder } from '@nestjs/testing';
import { HookScenarioResult } from 'cucumber';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createConnection } from 'mongoose';
import { DEFAULT_DB_CONNECTION, MONGOOSE_CONNECTION_NAME } from '../enums';
import { AbstractProvider } from './abstract.provider';

export class InMemoryProvider extends AbstractProvider {
  public async configure(
    builder: TestingModuleBuilder,
    scenario: HookScenarioResult,
  ): Promise<void> {
    const mongo: MongoMemoryServer = new MongoMemoryServer();
    const uri: string = await mongo.getConnectionString();

    this.testDatabaseName = uri;

    builder.overrideProvider(MONGOOSE_CONNECTION_NAME)
      .useValue(DEFAULT_DB_CONNECTION);

    builder.overrideProvider(DEFAULT_DB_CONNECTION)
      .useFactory({
        factory: async (): Promise<any> =>
          createConnection(
            uri,
            {
              useCreateIndex: true,
              useNewUrlParser: true,
            },
          ),
      });
  }
}
