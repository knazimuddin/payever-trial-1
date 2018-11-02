const nodeEnv: any = process.env.NODE_ENV;

import { environment as DevEnvironment } from './environment.dev';
import { environment as ProdEnvironment } from './environment.prod';
import { environment as StagingEnvironment } from './environment.staging';

export let environment: any = ProdEnvironment;

switch (nodeEnv) {
  case 'production':
    environment = ProdEnvironment;
    break;
  case 'staging':
    environment = StagingEnvironment;
    break;
  default:
    environment = DevEnvironment;
    break;
}
