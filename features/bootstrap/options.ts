import {
  AuthContext,
  AxiosContext,
  CucumberOptionsInterface,
  DatabaseContext,
  HttpContext,
  HttpProvider,
  InMemoryProvider,
  RabbitMqContext,
  StorageContext,
  WorldContext,
} from '@pe/cucumber-sdk/module/';
import { RabbitMqProvider } from '@pe/cucumber-sdk/module/rabbit';
import { RedisProvider } from '@pe/cucumber-sdk/module/redis';
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
  providers: [HttpProvider, InMemoryProvider, RabbitMqProvider, RedisProvider],
  mongodb: env.MONGODB_URL,
};
