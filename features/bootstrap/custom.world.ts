import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import * as cors from 'cors';
import { HookScenarioResult, setWorldConstructor } from 'cucumber';
import { SuperAgent, SuperAgentRequest } from 'superagent';
import * as supertest from 'supertest';

import { AppModule } from '../../src/app.module';
import { DatabaseProvider } from './database.provider';

export class CustomWorld {
  public attach;
  private initialized: boolean = false;
  private storage = {};
  private response;
  private logger: Logger;
  private application: INestApplication;
  private server: SuperAgent<SuperAgentRequest>;
  private headers: Array<{ name: string, value: string }> = [];
  private databaseProvider: DatabaseProvider;

  public constructor({attach, parameters}) {
    this.attach = attach;
    this.databaseProvider = new DatabaseProvider();
    this.logger = new Logger('Cucumber');
  }

  public async initApplication(scenario: HookScenarioResult) {
    if (this.initialized) {
      return;
    }

    const builder: TestingModuleBuilder = Test.createTestingModule({
      imports: [ AppModule ],
    });

    await this.databaseProvider.configure(builder, scenario);
    const module: TestingModule = await builder.compile();

    this.application = module.createNestApplication();
    this.application.useGlobalPipes(new ValidationPipe());
    this.application.setGlobalPrefix('/api');
    this.application.use(cors());

    await this.application.init();

    this.server = supertest(this.application.getHttpServer());
    await this.databaseProvider.setup(this.application, this.logger);

    this.initialized = true;
  }

  public getLogger(): Logger {
    return this.logger;
  }

  public async closeApplication() {
    if (!this.initialized) {
      return;
    }
    await this.application.close();
    this.response = null;
    this.server = null;
    this.headers = [];

    this.initialized = false;
  }

  public getApplication() {
    return this.application;
  }

  public getRequest(method: string, url: string): SuperAgentRequest {
    return this.server[method.toLowerCase()](url);
  }

  public addHeader(name: string, value: string) {
    this.headers.push({
      name,
      value,
    });
  }

  public applyHeaders(request: SuperAgentRequest) {
    for (const header of this.headers) {
      request.set(header.name, header.value);
    }

    return request;
  }

  public getDatabaseProvider(): DatabaseProvider {
    return this.databaseProvider;
  }
}

setWorldConstructor(CustomWorld);
