import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import { ElasticSearchService } from '../../../../src/transactions/services/elastic-search.service';
import { CurrencyExchangeService } from '../../../../src/transactions/services/currency-exchange.service';
import { ElasticsearchClient } from '@pe/nest-kit';
import { ListQueryDto } from '../../../../src/transactions/dto';
import { TransactionCartItemInterface } from '../../../../src/transactions/interfaces';


chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('Elastic Search Service', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: ElasticSearchService;
  let currencyExchangeService: CurrencyExchangeService;
  let elasticSearchClient: ElasticsearchClient;

  before(() => {
    currencyExchangeService = {
      getCurrencyExchangeRate: (): any => { },
    } as any;
    elasticSearchClient = {
      search: (): any => { },
    } as any;

    testService = new ElasticSearchService(currencyExchangeService, elasticSearchClient);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('getResult()', () => {
    it('should execute elastic search | excute first branch  of 1st level branching', async () => {
      const transactionItem: TransactionCartItemInterface = {
        fixed_shipping_price: 2.99,
        price: 100,
        price_net: 112,
        shipping_price: 2.00,
        shipping_settings_rate: 2,
        vat_rate: 13,
        weight: 0.4,
      } as any;

      const transaction: any = {
        amount: 123,
        delivery_fee: 10,
        down_payment: 300,
        history: [
          {
            amount: 5000,
          },
        ],
        items: [
          transactionItem,
        ],
        mongoId: '5e1ecae25834169e9587b4be',
        payment_fee: 2.99,
        total: 1000,
      } as any;

      const result: any = {
        body: {
          aggregations: {
            specific_status: {
              buckets: [
                {
                  key: 'pending',
                },
              ],
            },
            status: {
              buckets: [
                {
                  key: 'suceeded',
                },
              ],
            },
            total_amount: {
              buckets: [
                {
                  key: 'EUR',
                  total_amount: {
                    value: 123,
                  },
                },
              ],
            },
          },
          hits: {
            hits: [
              {
                _source: transaction,
              },
            ],
            total: 1,
          },

        },
      };
      const listDto: ListQueryDto = new ListQueryDto();
      listDto.filters = {
        channel_set_uuid: {
          value: "0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0",
        },
      }
      listDto.query = "title=iphone";
      listDto.currency = 'EUR';

      sandbox.stub(elasticSearchClient, 'search').resolves(result)
      sandbox.stub(currencyExchangeService, 'getCurrencyExchangeRate').resolves(1.23);
      await testService.getResult(listDto);
    });

    it('should excute elastic serach | second branch of 1st level branching', async () => {
      const transaction: any = {
        amount: 123,
        history: [
          {},
        ],
        items: [
          {},
        ],
        mongoId: '5e1ecae25834169e9587b4be',
        total: 1000,
      } as any;

      const result: any = {
        body: {
          aggregations: {
            specific_status: {
              buckets: [
                {
                  key: 'pending',
                },
              ],
            },
            status: {
              buckets: [
                {
                  key: 'suceeded',
                },
              ],
            },
            total_amount: {
              buckets: [
                {
                  key: 'EUR',
                  total_amount: {
                    value: 123,
                  },
                },
              ],
            },
          },
          hits: {
            hits: [
              {
                _source: transaction,
              },
            ],
            total: 1,
          },

        },
      };
      const listDto: ListQueryDto = new ListQueryDto();
      listDto.filters = null;
      listDto.query = null;
      sandbox.stub(elasticSearchClient, 'search').resolves(result)
      await testService.getResult(listDto);
    });

    it('should execute elastic search | cover further branching', async () => {
      const result: any = {
        body: {
          aggregations: {
            specific_status: {
              buckets: [
                {
                  key: 'pending',
                },
              ],
            },
            status: {
              buckets: [
                {
                  key: 'suceeded',
                },
              ],
            },
            total_amount: {
              buckets: [
                {
                  key: 'EUR',
                  total_amount: {
                    value: 123,
                  },
                },
              ],
            },
          },
          hits: {
            hits: [
              {
                _source: {
                  history: [],
                  items: [],
                },
              },
            ],
            total: 1,
          },
        },
      };
      const listDto: ListQueryDto = new ListQueryDto();
      listDto.filters = {
        uuid: {},
      }
      listDto.query = "title=iphone";
      listDto.currency = 'EUR';

      sandbox.stub(elasticSearchClient, 'search').resolves(result)
      sandbox.stub(currencyExchangeService, 'getCurrencyExchangeRate').resolves(1.23);
      await testService.getResult(listDto);
    });

    it('should execute elastic search | cover further branching', async () => {
      const result: any = {
        body: {
          aggregations: {
            specific_status: {
              buckets: [
                {
                  key: 'pending',
                },
              ],
            },
            status: {
              buckets: [
                {
                  key: 'suceeded',
                },
              ],
            },
            total_amount: {
              buckets: [
                {
                  key: 'EUR',
                  total_amount: {
                    value: 123,
                  },
                },
              ],
            },
          },
          hits: {
            hits: [
              {
                _source: {
                  history: [],
                  items: [],
                },
              },
            ],
            total: 1,
          },
        },
      };
      const listDto: ListQueryDto = new ListQueryDto();
      listDto.filters = {
        uuid: [
          {
            value: "0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0",
            condition: 'is',
          },
        ],
      }
      listDto.query = "title=iphone";
      listDto.currency = 'EUR';

      sandbox.stub(elasticSearchClient, 'search').resolves(result)
      sandbox.stub(currencyExchangeService, 'getCurrencyExchangeRate').resolves(null);
      await testService.getResult(listDto);
    });

    it('should execute elastic search | cover further branching', async () => {
      const result: any = {
        body: {
          aggregations: {
            specific_status: {
              buckets: [
                {
                  key: 'pending',
                },
              ],
            },
            status: {
              buckets: [
                {
                  key: 'suceeded',
                },
              ],
            },
            total_amount: {
              buckets: [
                {
                  key: 'EUR',
                  total_amount: {
                    value: 123,
                  },
                },
              ],
            },
          },
          hits: {
            hits: [
              {
                _source: {
                  history: [],
                  items: [],
                },
              },
            ],
            total: 1,
          },
        },
      };
      const listDto: ListQueryDto = new ListQueryDto();
      listDto.filters = {
        uuid: [
          {
            condition: 'random_condition',
            value: [
              "0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0",
            ],
          },
        ],
      }
      listDto.query = "title=iphone";
      listDto.currency = 'EUR';

      sandbox.stub(elasticSearchClient, 'search').resolves(result)
      sandbox.stub(currencyExchangeService, 'getCurrencyExchangeRate').resolves(1.23);
      await testService.getResult(listDto);
    });

  });
});
