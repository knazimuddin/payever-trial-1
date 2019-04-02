// needs to be replaced with service, currently I have crash by using nest's es module,
// needs to be investigated / replacing with custom.

import * as elasticsearch from 'elasticsearch'
export const client = new elasticsearch.Client({
  host: '10.0.0.28:9200',
  log: 'error'
});
