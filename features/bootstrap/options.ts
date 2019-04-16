import {
  CucumberOptionsInterface,
  DatabaseContext,
  HttpContext,
  InMemoryProvider,
  RabbitMqContext,
  StorageContext,
  WorldContext,
} from '@pe/cucumber-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { AppConfigurator } from './app.configurator';

dotenv.config();
const env = process.env;

export const options: CucumberOptionsInterface = {
  contexts: [
    DatabaseContext,
    WorldContext,
    HttpContext,
    StorageContext,
    RabbitMqContext,
  ],
  fixtures: path.resolve('./features/fixtures'),
  appConfigurator: AppConfigurator,
  databaseProvider: InMemoryProvider,
  mongodb: env.MONGODB_URL,
};
