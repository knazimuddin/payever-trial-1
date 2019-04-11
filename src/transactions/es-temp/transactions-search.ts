// needs to be replaced with service, currently I have crash by using nest's es module,
// needs to be investigated / replacing with custom.
import { environment } from '../../environments';

import * as elasticsearch from 'elasticsearch';
export const client = new elasticsearch.Client({
  host: environment.elasticSearch,
  log: 'error',
});
