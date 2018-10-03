const isProd: boolean = process.env['NODE_ENV'] === 'production';

import { environment as ProdEnvironment } from './environment.prod';
import { environment as DevEnvironment } from './environment.dev';

export let environment = ProdEnvironment;

if (isProd) {
  environment = ProdEnvironment;
} else {
  environment = DevEnvironment;
}

