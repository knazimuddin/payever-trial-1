import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';

import { CurrencyExchangeService } from '../../../../src/transactions/services/currency-exchange.service';
import { CurrencyService, CurrencyModel } from '@pe/common-sdk';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('CurrencyExchangeService', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: CurrencyExchangeService;
  let currencyService: CurrencyService;

  before(() => {
    currencyService = {
      findAll: (): any => { },
    } as any;

    testService = new CurrencyExchangeService(currencyService);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('getCurrencyExchangeRate()', () => {
    it('should return currency exchange rate', async () => {
      const dataList: CurrencyModel[] = [
        {
          id: 'EUR',
          rate: 1.23,
        } as any,
        {
          id: 'USD',
          rate: 1.10,
        } as any,
      ];
      sandbox.stub(currencyService, 'findAll').resolves(dataList);
      expect(
        await testService.getCurrencyExchangeRate('EUR'),
      ).to.eq(1.23);
      expect(
        await testService.getCurrencyExchangeRate('USD'),
      ).to.eq(1.10);
    });
  });
});
