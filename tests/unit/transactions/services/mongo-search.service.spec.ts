import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Model } from 'mongoose';
import { MongoSearchService } from '../../../../src/transactions/services/mongo-search.service';
import { TransactionModel } from '../../../../src/transactions/models';
import { CurrencyExchangeService } from '../../../../src/transactions/services/currency-exchange.service';
import { ListQueryDto } from '../../../../src/transactions/dto';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('MongoSearchService', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: MongoSearchService;
  let transactionModel: Model<TransactionModel>;
  let currencyExchangeService: CurrencyExchangeService;

  before(() => {
    currencyExchangeService = {
      getCurrencyExchangeRate: (): any => { },
    } as any;

    transactionModel = {
      find(): any { return this },
      limit(): any { return this },
      skip(): any { return this },
      sort(): any { return this },
      aggregate(): any { return this },
      countDocuments(): any { },
      distinct(): any { },
    } as any;

    testService = new MongoSearchService(transactionModel, currencyExchangeService);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('getResult()', () => {
    it('should return result', async () => {
      sandbox.stub(testService, 'search');
      sandbox.stub(testService, 'count');
      sandbox.stub(testService, 'total');
      sandbox.stub(testService, 'distinctFieldValues');

      const listDto: ListQueryDto = {
        filters: {
          channel_set_uuid: {
            value: {},
          },
          uuid: {
            value: {},
          },
          id: [
            {
              condition: 'is',
              value: [
                "search",
              ],
            },
            {
              value: {},
            },

            {},
          ],
        },
        search: "search_keyword",
      } as any;
      await testService.getResult(listDto);
    });

    it('should return result', async () => {
      sandbox.stub(testService, 'search');
      sandbox.stub(testService, 'count');
      sandbox.stub(testService, 'total').resolves(2);
      sandbox.stub(testService, 'distinctFieldValues');

      const listDto: ListQueryDto = {
        filters: {

          uuid: {
            value: {},
          },
        },
        search: "search_keyword",
      } as any;
      await testService.getResult(listDto);
    });
  });

  describe('search()', () => {
    it('should search for transactions', async () => {
      sandbox.stub()
      await testService.search(
        {}, { key: 'value' }, {} as any,
      );
    });
  });

  describe('count()', () => {
    it('shoud count the documents from search result', async () => {
      sandbox.stub(transactionModel, 'countDocuments')
      await testService.count({});
    });
  });

  describe('total()', () => {
    it('should return total value of transaction in EUR', async () => {
      const result: any = [
        {
          total: 2,
        },
        {
          total: 1,
        },
      ];

      sandbox.stub(transactionModel, 'aggregate').resolves(result);
      sandbox.stub(currencyExchangeService, 'getCurrencyExchangeRate')
        .onFirstCall().resolves(null)
        .onSecondCall().resolves(3)
        .onThirdCall().resolves(1);
      await testService.total({}, 'EUR');
    })

    it('should return total value of transaction', async () => {
      const result: any = [];

      sandbox.stub(transactionModel, 'aggregate').resolves(result);
      sandbox.stub(currencyExchangeService, 'getCurrencyExchangeRate')
        .onFirstCall().resolves(null)
      await testService.total({});
    })
    it('should return total value of transaction', async () => {
      const result: any = [
        {},
      ];

      sandbox.stub(transactionModel, 'aggregate').resolves(result);
      sandbox.stub(currencyExchangeService, 'getCurrencyExchangeRate')
        .onFirstCall().resolves(null)
      await testService.total({});
    })
  });

  describe('distinctFieldValues()', () => {
    it('should find destinct values', async () => {
      sandbox.stub(transactionModel, 'distinct').resolves([
        {
          _id: 123,
        },
      ]);
      await testService.distinctFieldValues('field', {});
    });
  });
});
