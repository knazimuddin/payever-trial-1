import * as dotenv from 'dotenv';
import * as path from 'path';
import { CucumberOptionsInterface, DatabaseContext, HttpContext, WorldContext } from '../../e-test-module';
import { InMemoryProvider } from '../../e-test-module/database';

dotenv.config();
const env = process.env;

export const options: CucumberOptionsInterface = {
  contexts: [
    DatabaseContext,
    WorldContext,
    HttpContext,
  ],
  fixtures: path.resolve('./features/fixtures'),
  databaseProvider: InMemoryProvider,
  mongodb: env.MONGODB_URL,
};
