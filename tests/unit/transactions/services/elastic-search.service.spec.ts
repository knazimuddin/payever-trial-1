import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import { ElasticSearchService } from '../../../../src/transactions/services/elastic-search.service';
import { CurrencyExchangeService } from '../../../../src/transactions/services/currency-exchange.service';
import { ElasticsearchClient } from '@pe/nest-kit';
import { ListQueryDto, PagingResultDto } from '../../../../src/transactions/dto';
import { TransactionCartItemInterface, TransactionBasicInterface } from '../../../../src/transactions/interfaces';
import { ElasticTransactionEnum } from '../../../../src/transactions/enum';

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
    it('should get Result', async () => {
      const transactionBasic: TransactionBasicInterface = {
        amount: 100,
        delivery_fee: 2.99,
        down_payment: 50,
        history: [
          {
            amount: 70,
          },
        ],
        items: [
          {
            fixed_shipping_price: 1.99,
            price: 20,
            price_net: 19,
            shipping_price: 2.00,
            shipping_settings_rate: 5,
            vat_rate: 13,
            weight: 200,
          },
        ],
        payment_fee: 0.2,
        total: 112,
      } as TransactionBasicInterface;

      const elasticSearchResult: any = {
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
                  key: 'NPR',
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
                  mongoId: '5e2eeaab4c6f68dc49dbfdcd',
                  ...transactionBasic,
                },
              },
            ],
            total: 1,
          },
        },
      };

      const listDto: ListQueryDto = new ListQueryDto();
      listDto.filters = {
        business_uuid: {
          condition: 'is',
          value: '1f5fdd26-0ae5-4653-a524-5ac5d4dfbf52',
        },
        channel_set_uuid: {
          value: ["0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0"],
        },
        uuid: [
          {
            condition: 'random_condition',
            value: [
              "0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0",
            ],
          },
          {
            condition: 'is',
            value: "0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0",
          },
          {},
        ],
      }
      listDto.query = "title=iphone";
      listDto.currency = 'EUR';
      listDto.orderBy = 'created_at';
      listDto.direction = 'asc';
      listDto.page = 1;
      listDto.limit = 10;

      const currencyExchangeRate: number = 1.23;

      sandbox.stub(elasticSearchClient, 'search').resolves(elasticSearchResult);
      sandbox.stub(currencyExchangeService, 'getCurrencyExchangeRate').resolves(currencyExchangeRate);

      const result: PagingResultDto = await testService.getResult(listDto);

      expect(currencyExchangeService.getCurrencyExchangeRate)
        .calledWith('NPR')
        .calledWith('EUR');
      expect(elasticSearchClient.search)
        .calledWithExactly(ElasticTransactionEnum.index, {
          aggs: {
            status: {
              terms: {
                field: 'status',
              },
            },
          },
          from: 0,
          query: {
            bool: {
              must: [
                {
                  match_phrase: { business_uuid: '1f5fdd26-0ae5-4653-a524-5ac5d4dfbf52' },
                },
                {
                  match_phrase: { channel_set_uuid: '0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0' },
                },
                { match_phrase: { uuid: '0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0' } },
                {
                  query_string: {
                    fields: [
                      'original_id^1',
                      'customer_name^1',
                      'merchant_name^1',
                      'reference^1',
                      'payment_details.finance_id^1',
                      'payment_details.application_no^1',
                      'customer_email^1',
                    ],
                    query: '*title=iphone*',
                  },
                },
              ],
              must_not: [],
            },
          },
        })
        .calledWithExactly(ElasticTransactionEnum.index, {
          aggs: {
            specific_status: {
              terms: {
                field: 'specific_status',
              },
            },
          },
          from: 0,
          query: {
            bool: {
              must: [
                {
                  match_phrase: { business_uuid: '1f5fdd26-0ae5-4653-a524-5ac5d4dfbf52' },
                },
                {
                  match_phrase: { channel_set_uuid: '0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0' },
                },
                { match_phrase: { uuid: '0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0' } },
                {
                  query_string: {
                    fields: [
                      'original_id^1',
                      'customer_name^1',
                      'merchant_name^1',
                      'reference^1',
                      'payment_details.finance_id^1',
                      'payment_details.application_no^1',
                      'customer_email^1',
                    ],
                    query: '*title=iphone*',
                  },
                },
              ],
              must_not: [],
            },
          },
        })
      expect(result).to.deep.equal({
        collection: [
          {
            _id: '5e2eeaab4c6f68dc49dbfdcd',
            amount: 1,
            delivery_fee: 0.029900000000000003,
            down_payment: 0.5,
            history: [{ amount: 0.7 }],
            items: [
              {
                fixed_shipping_price: 0.0199,
                price: 0.2,
                price_net: 0.19,
                shipping_price: 0.02,
                shipping_settings_rate: 0.05,
                vat_rate: 0.13,
                weight: 2,
              },
            ],
            payment_fee: 0.002,
            total: 1.12,
          },
        ],
        filters: {},
        pagination_data: {
          amount: 1.23,
          amount_currency: 'EUR',
          page: 1,
          total: 1,
        },
        usage: { specific_statuses: ['PENDING'], statuses: ['SUCEEDED'] },
      });
    });

    it('should get Result when listFilterDto does not have \'currency\'', async () => {
      const transactionBasic: TransactionBasicInterface = {
        amount: 100,
        delivery_fee: 2.99,
        down_payment: 50,
        history: [
          {
            amount: 70,
          },
        ],
        items: [
          {
            fixed_shipping_price: 1.99,
            price: 20,
            price_net: 19,
            shipping_price: 2.00,
            shipping_settings_rate: 5,
            vat_rate: 13,
            weight: 200,
          },
        ],
        payment_fee: 0.2,
        total: 112,
      } as TransactionBasicInterface;

      const elasticSearchResult: any = {
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
                  key: 'NPR',
                  total_amount: {
                    value: 123,
                  },
                },
              ],
              value: 200,
            },
          },
          hits: {
            hits: [
              {
                _source: {
                  mongoId: '5e2eeaab4c6f68dc49dbfdcd',
                  ...transactionBasic,
                },
              },
            ],
            total: 1,
          },
        },
      };

      const listDto: ListQueryDto = new ListQueryDto();
      listDto.filters = {
        business_uuid: {
          condition: 'is',
          value: '1f5fdd26-0ae5-4653-a524-5ac5d4dfbf52',
        },
        channel_set_uuid: {
          value: ["0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0"],
        },
        uuid: [
          {
            condition: 'random_condition',
            value: [
              "0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0",
            ],
          },
          {
            condition: 'is',
            value: "0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0",
          },
          {},
        ],
      }
      listDto.query = "title=iphone";
      listDto.orderBy = 'created_at';
      listDto.direction = 'asc';
      listDto.page = 1;
      listDto.limit = 10;

      const currencyExchangeRate: number = 1.23;

      sandbox.stub(elasticSearchClient, 'search').resolves(elasticSearchResult);
      sandbox.stub(currencyExchangeService, 'getCurrencyExchangeRate').resolves(currencyExchangeRate);

      const result: PagingResultDto = await testService.getResult(listDto);

      expect(currencyExchangeService.getCurrencyExchangeRate)
        .not.calledWith('NPR')
        .not.calledWith('EUR');
      expect(elasticSearchClient.search)
        .calledWithExactly(ElasticTransactionEnum.index, {
          aggs: {
            status: {
              terms: {
                field: 'status',
              },
            },
          },
          from: 0,
          query: {
            bool: {
              must: [
                {
                  match_phrase: { business_uuid: '1f5fdd26-0ae5-4653-a524-5ac5d4dfbf52' },
                },
                {
                  match_phrase: { channel_set_uuid: '0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0' },
                },
                { match_phrase: { uuid: '0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0' } },
                {
                  query_string: {
                    fields: [
                      'original_id^1',
                      'customer_name^1',
                      'merchant_name^1',
                      'reference^1',
                      'payment_details.finance_id^1',
                      'payment_details.application_no^1',
                      'customer_email^1',
                    ],
                    query: '*title=iphone*',
                  },
                },
              ],
              must_not: [],
            },
          },
        })
        .calledWithExactly(ElasticTransactionEnum.index, {
          aggs: {
            specific_status: {
              terms: {
                field: 'specific_status',
              },
            },
          },
          from: 0,
          query: {
            bool: {
              must: [
                {
                  match_phrase: { business_uuid: '1f5fdd26-0ae5-4653-a524-5ac5d4dfbf52' },
                },
                {
                  match_phrase: { channel_set_uuid: '0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0' },
                },
                { match_phrase: { uuid: '0f82d7e8-f24e-403e-ab0d-37fe9fd3e8d0' } },
                {
                  query_string: {
                    fields: [
                      'original_id^1',
                      'customer_name^1',
                      'merchant_name^1',
                      'reference^1',
                      'payment_details.finance_id^1',
                      'payment_details.application_no^1',
                      'customer_email^1',
                    ],
                    query: '*title=iphone*',
                  },
                },
              ],
              must_not: [],
            },
          },
        })
      expect(result).to.deep.equal({
        collection: [
          {
            _id: '5e2eeaab4c6f68dc49dbfdcd',
            amount: 1,
            delivery_fee: 0.029900000000000003,
            down_payment: 0.5,
            history: [{ amount: 0.7 }],
            items: [
              {
                fixed_shipping_price: 0.0199,
                price: 0.2,
                price_net: 0.19,
                shipping_price: 0.02,
                shipping_settings_rate: 0.05,
                vat_rate: 0.13,
                weight: 2,
              },
            ],
            payment_fee: 0.002,
            total: 1.12,
          },
        ],
        filters: {},
        pagination_data: {
          amount: 2,
          amount_currency: undefined,
          page: 1,
          total: 1,
        },
        usage: { specific_statuses: ['PENDING'], statuses: ['SUCEEDED'] },
      });
    });

  });


});
