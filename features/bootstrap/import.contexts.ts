import { ContextsResolver } from '@pe/cucumber-sdk';
import { options } from './options';

ContextsResolver.resolve(options.contexts);
