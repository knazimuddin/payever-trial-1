import { TestingModuleBuilder } from '@nestjs/testing';
import { HookScenarioResult, SourceLocation } from 'cucumber';
import { trim } from 'lodash';
import { Connection, createConnection } from 'mongoose';
import * as uuid5 from 'uuid/v5';
import { DEFAULT_DB_CONNECTION, MONGOOSE_CONNECTION_NAME } from '../enums';
import { AbstractProvider } from './abstract.provider';

export class PersistentProvider extends AbstractProvider {
  private originalDatabaseName: string;

  public async configure(builder: TestingModuleBuilder, scenario: HookScenarioResult): Promise<void> {
    const originalConnectionUrl: string = this.options.mongodb;
    const originalDatabaseName: string = this.extractDatabaseName(originalConnectionUrl);
    const sourceLocation: SourceLocation = scenario.sourceLocation;
    const hash = uuid5(`${sourceLocation.uri}:${sourceLocation.line}`, uuid5.DNS);
    const testDatabaseName: string = originalDatabaseName + '-' + hash;
    const testConnectionUrl: string = originalConnectionUrl.replace(`/${originalDatabaseName}`, `/${testDatabaseName}`);

    this.originalDatabaseName = originalDatabaseName;
    this.testDatabaseName = testDatabaseName;

    builder.overrideProvider(MONGOOSE_CONNECTION_NAME)
      .useValue(DEFAULT_DB_CONNECTION);

    builder.overrideProvider(DEFAULT_DB_CONNECTION)
      .useFactory({
        factory: async (): Promise<any> =>
          createConnection(
            testConnectionUrl,
            {
              useCreateIndex: true,
              useNewUrlParser: true,
            },
          ),
      });

    await this.drop();
  }

  private async drop(): Promise<void> {
    const originalConnectionUrl: string = this.options.mongodb;
    const connectionUrl: string = originalConnectionUrl.replace(
      `/${this.originalDatabaseName}`,
      `/${this.testDatabaseName}`,
    );

    const connection: Connection = await createConnection(connectionUrl, { useNewUrlParser: true });
    await connection.db.dropDatabase();
    await connection.close();
  }

  private extractDatabaseName(connectionUrl: string) {
    const originalConnectionUrlParsed: URL = new URL(connectionUrl);

    return trim(originalConnectionUrlParsed.pathname, '/');
  }
}
