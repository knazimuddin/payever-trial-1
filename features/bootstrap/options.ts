import {
  AxiosContext,
  CucumberOptionsInterface,
  DatabaseContext,
  HttpContext,
  PersistentProvider,
  RabbitMqContext,
  StorageContext,
  WorldContext,
} from '@pe/cucumber-sdk/module/';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { AppConfigurator } from './app.configurator';

dotenv.config({});
const env = process.env;

export const options: CucumberOptionsInterface = {
  contexts: [
    DatabaseContext,
    WorldContext,
    HttpContext,
    StorageContext,
    RabbitMqContext,
    AxiosContext,
  ],
  fixtures: path.resolve('./features/fixtures'),
  appConfigurator: AppConfigurator,
  databaseProvider: PersistentProvider,
  mongodb: env.MONGODB_URL,
};
