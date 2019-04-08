import { INestApplication, Logger, Type } from '@nestjs/common';
import { TestingModuleBuilder } from '@nestjs/testing';
import { HookScenarioResult } from 'cucumber';
import * as fs from 'fs';
import { Connection } from 'mongoose';
import { BaseFixture } from '../base.fixture';
import { CucumberOptionsInterface } from '../cucumber-options.interface';
import { DEFAULT_DB_CONNECTION } from '../enums';

export abstract class AbstractProvider {
  protected application: INestApplication;
  protected logger: Logger;
  protected options: CucumberOptionsInterface;
  protected databaseConnection: Connection;
  protected testDatabaseName: string;

  public abstract async configure(
    builder: TestingModuleBuilder,
    scenario: HookScenarioResult,
  ): Promise<void>;

  public setup(
    application: INestApplication,
    logger: Logger,
    options: CucumberOptionsInterface,
  ): void {
    this.application = application;
    this.logger = logger;
    this.options = options;
    this.databaseConnection = application.get(DEFAULT_DB_CONNECTION);
  }

  public async applyFixture(name: string): Promise<void> {
    const file: string = `${this.options.fixtures}/${name}.fixture.ts`;

    if (!fs.existsSync(file)) {
      this.logger.error(`Fixture "${file}" not found.`);

      return;
    }

    const fixtureClass: Type<BaseFixture> = require(file);
    const fixture: BaseFixture = new fixtureClass(this.databaseConnection, this.application);
    await fixture.apply();
  }

  public getDatabaseName(): string {
    return this.testDatabaseName;
  }

  public getDatabaseConnection() {
    return this.databaseConnection;
  }
}
