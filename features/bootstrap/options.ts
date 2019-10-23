import {
  AuthContext,
  AxiosContext,
  CucumberOptionsInterface,
  DatabaseContext,
  ElasticsearchContext,
  HttpContext,
  HttpProvider,
  InMemoryProvider,
  RabbitMqContext,
  RabbitMqRpcContext,
  StorageContext,
  WorldContext,
} from '@pe/cucumber-sdk/module/';
import { RabbitMqProvider } from '@pe/cucumber-sdk/module/rabbit';
import { RedisProvider } from '@pe/cucumber-sdk/module/redis';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { AppConfigurator } from './app.configurator';
import { ElasticsearchProvider } from '@pe/cucumber-sdk/module/elasticsearch';

dotenv.config({});
const env = process.env;

export const options: CucumberOptionsInterface = {
  contexts: [
    ElasticsearchContext,
    RabbitMqRpcContext,
    AuthContext,
    DatabaseContext,
    HttpContext,
    StorageContext,
    RabbitMqContext,
    AxiosContext,
    WorldContext,
  ],
  fixtures: path.resolve('./features/fixtures'),
  appConfigurator: AppConfigurator,
  providers: [
    InMemoryProvider,
    ElasticsearchProvider,
    RabbitMqProvider,
    RedisProvider,
    HttpProvider,
  ],
  mongodb: env.MONGODB_URL,
};
