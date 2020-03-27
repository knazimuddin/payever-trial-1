import { Test } from '@nestjs/testing';
import { RabbitMqClient } from '@pe/nest-kit';
import * as chai from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { DailyReportTransactionMailerReportEventProducer } from '../../../../src/transactions/producer';
import { DailyReportCurrencyDto } from '../../../../src/transactions/dto';

process.env.RABBITMQ_CERTIFICATE_PATH = process.env.RABBITMQ_CERTIFICATE_PATH || './rabbitcrypt/private/private.crt'
import { environment } from '../../../../src/environments';

chai.use(sinonChai);
const expect = chai.expect;

describe('PaymentMailEventProducer ', () => {
  let sandbox: sinon.SinonSandbox;
  let dailyReportTransactionMailerReportEventProducer: DailyReportTransactionMailerReportEventProducer;
  let rabbitMqClient: RabbitMqClient;

  before(async () => {
    const module = await Test.createTestingModule({
      controllers: [DailyReportTransactionMailerReportEventProducer],
      providers: [
        {
          provide: RabbitMqClient,
          useValue: {
            send: () => {},
          },
        },
      ],
    }).compile();

    rabbitMqClient = module.get<RabbitMqClient>(RabbitMqClient);
    dailyReportTransactionMailerReportEventProducer = module.get<DailyReportTransactionMailerReportEventProducer>(DailyReportTransactionMailerReportEventProducer);
  });

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(rabbitMqClient, 'send').resolves();
  });

  afterEach(async () => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('produceDailyReportTransactionEvent method', () => {
    it('should send mail for mailer-report event ', async () => {
      const eventName = 'transactions.event.report.daily';
      const transactions: DailyReportCurrencyDto[] = [
      {
        "currency": "EUR",
        "exchangeRate": 1,
        "overallTotal": 20000,
        "paymentOption": [
          {
            "overallTotal": 10000,
            "paymentOption": "stripe",
            "todayTotal": 500,
          },
          {
            "overallTotal": 10000,
            "paymentOption": "santander_pos_invoice_de",
            "todayTotal": 0,
          }
        ],
        "todayTotal": 500,
      },
      {
        "currency": "SEK",
        "exchangeRate": 11.1523,
        "overallTotal": 200000,
        "paymentOption": [
          {
            "overallTotal": 100000,
            "paymentOption": "stripe",
            "todayTotal": 50000,
          },
          {
            "overallTotal": 100000,
            "paymentOption": "paymill_creditcard",
            "todayTotal": 0,
          }
        ],
        "todayTotal": 50000,
      }];

      await dailyReportTransactionMailerReportEventProducer.produceDailyReportTransactionEvent(transactions);

      expect(rabbitMqClient.send).to.have.been.calledWithMatch(
        {
          exchange: 'async_events',
          channel: eventName,
        },
        {
          name: eventName,
          payload: transactions,
        },
      );
    });
  });
});
