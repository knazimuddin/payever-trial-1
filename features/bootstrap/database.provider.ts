import { INestApplication, Logger } from '@nestjs/common';
import { TestingModuleBuilder } from '@nestjs/testing';
import { HookScenarioResult, SourceLocation } from 'cucumber';
import * as fs from 'fs';
import { trim } from 'lodash';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, createConnection } from 'mongoose';
import * as uuid5 from 'uuid/v5';
import { environment } from '../../src/environments';
import { BaseFixture } from './base.fixture';
import { DEFAULT_DB_CONNECTION, MONGOOSE_CONNECTION_NAME } from './enums/mongoose.constants';

export class DatabaseProvider {
  private logger: Logger;
  private application: INestApplication;
  private databaseConnection: Connection;
  private testDatabaseName: string;
  private originalDatabaseName: string;

  public getDatabaseName(): string {
    return this.testDatabaseName;
  }

  public getDatabaseConnection() {
    return this.databaseConnection;
  }

  public async configure(builder: TestingModuleBuilder, scenario: HookScenarioResult): Promise<void> {
    const mongod = new MongoMemoryServer();
    const uri = await mongod.getConnectionString();

    console.log(uri);

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

    // await this.drop();
  }

  public async configure2(builder: TestingModuleBuilder, scenario: HookScenarioResult): Promise<void> {
    const originalConnectionUrl: string = environment.mongodb;
    const originalDatabaseName: string = this.extractDatabaseName(environment.mongodb);
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

  public setup(application: INestApplication, logger: Logger): void {
    this.application = application;
    this.logger = logger;
    this.databaseConnection = application.get(DEFAULT_DB_CONNECTION);
  }

  public async applyFixture(name: string): Promise<void> {
    const dir: string = __dirname + '/fixtures';
    const file: string = `${dir}/${name}.fixture.ts`;

    if (!fs.existsSync(file)) {
      this.logger.error(`Fixture "${file}" not found.`);

      return;
    }

    const fixtureClass = require(`${dir}/${name}.fixture.ts`);
    const fixture: BaseFixture = new fixtureClass(this.databaseConnection, this.application);
    await fixture.apply();
  }

  private async drop(): Promise<void> {
    const originalConnectionUrl: string = environment.mongodb;
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
