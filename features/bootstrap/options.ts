import {
  CucumberOptionsInterface,
  DatabaseContext,
  HttpContext,
  InMemoryProvider,
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
  ],
  fixtures: path.resolve('./features/fixtures'),
  appConfigurator: AppConfigurator,
  databaseProvider: InMemoryProvider,
  mongodb: env.MONGODB_URL,
};
