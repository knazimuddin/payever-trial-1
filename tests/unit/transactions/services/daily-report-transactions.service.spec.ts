/* tslint:disable:no-big-function */
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import 'mocha';
import * as moment from 'moment';
import { Model } from 'mongoose';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { ExchangeCalculator, ExchangeCalculatorFactory } from '../../../../src/transactions/currency';
import { DailyReportCurrencyDto, DailyReportFilterDto } from '../../../../src/transactions/dto';

import { TransactionModel } from '../../../../src/transactions/models';
import { DailyReportTransactionsService } from '../../../../src/transactions/services';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('DailyReportTransactionsService', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: DailyReportTransactionsService;
  let exchangeCalculator: ExchangeCalculator;
  let exchangeCalculatorFactory: ExchangeCalculatorFactory;
  let transactionModel: Model<TransactionModel>;

  before(() => {
    exchangeCalculator = {
      getCurrencyExchangeRate: (): any => { },
    } as any;
    exchangeCalculatorFactory = {
      create: (): any => { },
    } as any;

    transactionModel = {
      find(): any { return this; },
      limit(): any { return this; },
      skip(): any { return this; },
      sort(): any { return this; },
      aggregate(): any { return this; },
      countDocuments(): any { },
      distinct(): any { },
    } as any;

    testService = new DailyReportTransactionsService(transactionModel, exchangeCalculatorFactory);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('getDailyReportCurrency()', () => {
    it('should process successfully daily report transaction', async () => {

      const dailyReportFilterDto: DailyReportFilterDto = {
        beginDate: new Date(),
      };
      const todayDate: Date = moment(dailyReportFilterDto.beginDate).toDate();
      const todayFilter: any[] = [
        { $match: { created_at: { $gte: todayDate}} },
        { '$group': { _id: '$currency', total: { '$sum': '$total' } } },
      ];
      const beforeTodayFilter: any[] = [
        { $match: { created_at: { $lt: todayDate}} },
        { '$group': { _id: '$currency', total: { '$sum': '$total' } } },
      ];

      const todayPaymentFilter: any[] = [
        { $match: { created_at: { $gte: todayDate}} },
        { '$group': { _id: { currency: '$currency', type: '$type'}, total: { '$sum': '$total' } } },
      ];
      const beforeTodayPaymentFilter: any[] = [
        { $match: { created_at: { $lt: todayDate}} },
        { '$group': { _id: { currency: '$currency', type: '$type'}, total: { '$sum': '$total' } } },
      ];

      sandbox.stub(exchangeCalculatorFactory, 'create').returns(exchangeCalculator);
      sandbox.stub(exchangeCalculator, 'getCurrencyExchangeRate')
      .onFirstCall().resolves(1)
      .onSecondCall().resolves(11.1523)
      .onThirdCall().resolves(11.9745);

      sandbox.stub(transactionModel, 'aggregate')
      .onFirstCall().resolves([
        {
          _id: 'EUR',
          exchangeRate: 1,
          total: 1000,
        },
        {
          _id: 'SEK',
          exchangeRate: 11.1523,
          total: 50000,
        },
      ])
      .onSecondCall().resolves([
        {
          _id: 'EUR',
          exchangeRate: 1,
          total: 20000,
        },
        {
          _id: 'SEK',
          exchangeRate: 11.1523,
          total: 200000,
        },
        {
          _id: 'NOK',
          exchangeRate: 11.9745,
          total: 150000,
        },
      ])
      .onThirdCall().resolves([
        {
          _id: {
            currency: 'EUR',
            type: 'stripe',
          },
          total: 500,
        },
        {
          _id: {
            currency: 'EUR',
            type: 'santander_pos_invoice_de',
          },
          total: 0,
        },
        {
          _id: {
            currency: 'SEK',
            type: 'stripe',
          },
          total: 50000,
        },
        {
          _id: {
            currency: 'SEK',
            type: 'paymill_creditcard',
          },
          total: 0,
        },
        {
          _id: {
            currency: 'USD',
            type: 'stripe',
          },
          total: 1,
        },
      ])
      .onCall(3).resolves([
        {
          _id: {
            currency: 'EUR',
            type: 'stripe',
          },
          total: 10000,
        },
        {
          _id: {
            currency: 'EUR',
            type: 'santander_pos_invoice_de',
          },
          total: 10000,
        },
        {
          _id: {
            currency: 'SEK',
            type: 'stripe',
          },
          total: 100000,
        },
        {
          _id: {
            currency: 'SEK',
            type: 'paymill_creditcard',
          },
          total: 100000,
        },
        {
          _id: {
            currency: 'NOK',
            type: 'stripe',
          },
          total: 150000,
        },
        {
          _id: {
            currency: 'USD',
            type: 'stripe',
          },
          total: 1,
        },
      ]);

      const currencyReport: DailyReportCurrencyDto[] = await testService.getDailyReportCurrency(dailyReportFilterDto);
      await testService.getDailyReportPaymentOption(dailyReportFilterDto, currencyReport);

      expect(exchangeCalculator.getCurrencyExchangeRate)
        .calledWith('EUR')
        .calledWith('SEK')
        .calledWith('NOK');

      expect(transactionModel.aggregate).calledWithExactly(todayFilter);
      expect(transactionModel.aggregate).calledWithExactly(beforeTodayFilter);
      expect(transactionModel.aggregate).calledWithExactly(todayPaymentFilter);
      expect(transactionModel.aggregate).calledWithExactly(beforeTodayPaymentFilter);

      expect(currencyReport).to.deep.equal([
        {
          currency: 'EUR',
          exchangeRate: 1,
          overallTotal: 20000,
          paymentOption: [
            {
              overallTotal: 10000,
              paymentOption: 'stripe',
              todayTotal: 500,
            }, {
              overallTotal: 10000,
              paymentOption: 'santander_pos_invoice_de',
              todayTotal: 0,
            },
          ],
          todayTotal: 1000,
        }, {
          currency: 'SEK',
          exchangeRate: 11.1523,
          overallTotal: 200000,
          paymentOption: [
            {
              overallTotal: 100000,
              paymentOption: 'stripe',
              todayTotal: 50000,
            }, {
              overallTotal: 100000,
              paymentOption: 'paymill_creditcard',
              todayTotal: 0,
            },
          ],
          todayTotal: 50000,
        }, {
          currency: 'NOK',
          exchangeRate: 11.9745,
          overallTotal: 150000,
          paymentOption: [
            {
              overallTotal: 150000,
              paymentOption: 'stripe',
              todayTotal: 0,
            },
          ],
          todayTotal: 0,
        },
      ]);
    });
  });

});
