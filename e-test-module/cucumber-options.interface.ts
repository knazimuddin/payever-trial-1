import { Type } from '@nestjs/common';
import { ContextInterface } from './context.interface';
import { AbstractProvider as DatabaseProvider } from './database/abstract.provider';

export interface CucumberOptionsInterface {
  contexts: Array<Type<ContextInterface>>;
  fixtures: string;
  databaseProvider: Type<DatabaseProvider>;
  mongodb: string;
}
