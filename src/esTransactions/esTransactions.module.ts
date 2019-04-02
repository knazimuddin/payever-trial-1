import {Module} from "@nestjs/common";
import { ElasticsearchModule} from '@nestjs/elasticsearch'

@Module({
  imports: [ElasticsearchModule.register({
    host: 'localhost:9200',
    log: 'trace',
  })],
})
export class TransactionsEsSearch {}
