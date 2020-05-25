import { CurrencyModel, CurrencyService } from '@pe/common-sdk';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import { ExchangeCalculator } from '../../../../src/transactions/currency';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('ExchangeCalculator', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: ExchangeCalculator;
  let currencyService: CurrencyService;

  before(() => {
    currencyService = {
      getCurrencyByCode: (): any => { },
    } as any;

    testService = new ExchangeCalculator(currencyService);
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
      const eurCurrency: CurrencyModel = {
        id: 'EUR',
        rate: 1.23,
      } as any;
      const usdCurrency: CurrencyModel = {
        id: 'USD',
        rate: 1.10,
      } as any;

      sandbox.stub(currencyService, 'getCurrencyByCode')
        .onFirstCall().resolves(eurCurrency)
        .onSecondCall().resolves(usdCurrency)
      ;
      expect(
        await testService.getCurrencyExchangeRate('EUR'),
      ).to.eq(1.23);
      expect(
        await testService.getCurrencyExchangeRate('USD'),
      ).to.eq(1.10);
    });
  });
});
