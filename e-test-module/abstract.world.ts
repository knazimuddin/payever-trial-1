import { INestApplication, Logger, NestModule, Type, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import * as cors from 'cors';
import { HookScenarioResult } from 'cucumber';
import { SuperAgent, SuperAgentRequest } from 'superagent';
import * as supertest from 'supertest';
import { CucumberOptionsInterface } from './cucumber-options.interface';
import { AbstractProvider as DatabaseProvider } from './database/abstract.provider';

export abstract class AbstractWorld {
  public attach;
  public parameters;
  protected appModule: Type<NestModule>;
  protected options: CucumberOptionsInterface;
  protected initialized: boolean = false;
  protected storage = {};
  public response;
  protected logger: Logger;
  protected application: INestApplication;
  protected server: SuperAgent<SuperAgentRequest>;
  protected headers: Array<{ name: string, value: string }> = [];
  protected databaseProvider: DatabaseProvider;

  protected constructor(
    {attach, parameters},
    appModule: Type<NestModule>,
    options: CucumberOptionsInterface,
  ) {
    this.attach = attach;
    this.parameters = parameters;
    this.appModule = appModule;
    this.options = options;
    this.logger = new Logger('Cucumber');

    const databaseProviderClass: Type<DatabaseProvider> = options.databaseProvider;
    this.databaseProvider = new databaseProviderClass();
  }

  public async initApplication(scenario: HookScenarioResult) {
    if (this.initialized) {
      return;
    }

    const builder: TestingModuleBuilder = Test.createTestingModule({
      imports: [ this.appModule ],
    });

    await this.databaseProvider.configure(builder, scenario);
    const module: TestingModule = await builder.compile();

    this.application = module.createNestApplication();
    this.application.useGlobalPipes(new ValidationPipe());
    this.application.setGlobalPrefix('/api');
    this.application.use(cors());

    await this.application.init();

    this.server = supertest(this.application.getHttpServer());
    await this.databaseProvider.setup(this.application, this.logger, this.options);

    this.initialized = true;
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

  public getLogger(): Logger {
    return this.logger;
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
