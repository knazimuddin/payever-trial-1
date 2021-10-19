import {
  AuthContext,
  AxiosContext,
  CucumberOptionsInterface,
  DatabaseContext,
  HttpContext,
  HttpProvider,
  InMemoryProvider,
  RabbitMqContext,
  RabbitMqRpcContext,
  StorageContext,
  WorldContext,
} from '@pe/cucumber-sdk/module/';
import { ElasticSearchProvider } from '@pe/cucumber-sdk/module/elasticsearch';
import { RabbitMqProvider } from '@pe/cucumber-sdk/module/rabbit';
import { RedisProvider } from '@pe/cucumber-sdk/module/redis';
import { ElasticsearchContext } from '@pe/cucumber-sdk/module/contexts/elasticsearch.context';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { AppConfigurator } from './app.configurator';
import { environment } from '../../src/environments';
import ProcessEnv = NodeJS.ProcessEnv;

dotenv.config({});
const env: ProcessEnv = process.env;
environment.microUrlMedia = 'http://media-micro.url';

export const options: CucumberOptionsInterface = {
  appConfigurator: AppConfigurator,
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
  mongodb: env.MONGODB_URL,
  providers: [
    InMemoryProvider,
    ElasticSearchProvider,
    RabbitMqProvider,
    RedisProvider,
    HttpProvider,
  ],
};
