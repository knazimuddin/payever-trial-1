import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { SendDailyReportTransactionsCron } from '../../../../src/transactions/cron';

import { DailyReportTransactionMailEventProducer } from '../../../../src/transactions/producer';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as chai from 'chai';
import { DailyReportTransactionsService } from '../../../../src/transactions/services';
import { DailyReportDto } from '../../../../src/transactions/dto';

chai.use(sinonChai);

const expect: Chai.ExpectStatic = chai.expect;

describe('Currency Updater Service', () => {
  let sendDailyReportTransactionsCron: SendDailyReportTransactionsCron;
  let dailyReportTransactionsService: DailyReportTransactionsService;
  let sandbox: sinon.SinonSandbox;
  let dailyReportTransactionMailEventProducer: DailyReportTransactionMailEventProducer;

  const mockedAxios: MockAdapter = new MockAdapter(axios);

  const logger: any = {
    errorsList: [],
    logMessagesList: [],

    log: (message: string): void => {
      logger.logMessagesList.push(message);
    },

    error: (message: string): void => {
      logger.errorsList.push(message);
    },
  };



  before(async () => {
    const cbrUrl: string =
      'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';

    const cbrResponse: string =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01" ' +
      'xmlns="http://www.ecb.int/vocabulary/2002-08-01/eurofxref">' +
      '<gesmes:subject>Reference rates</gesmes:subject>' +
      '<gesmes:Sender>' +
      '<gesmes:name>European Central Bank</gesmes:name>' +
      '</gesmes:Sender>' +
      '<Cube>' +
      "<Cube time='2019-01-07'>" +
      "<Cube currency='USD' rate='1.1445'/>" +
      "<Cube currency='GBP' rate='0.89720'/>" +
      "<Cube currency='HUF' rate='321.11'/>" +
      "<Cube currency='SEK' rate='10.2235'/>" +
      "<Cube currency='CHF' rate='1.1227'/>" +
      '</Cube>' +
      '</Cube>' +
      '</gesmes:Envelope>';

    mockedAxios.onGet(cbrUrl).reply(200, cbrResponse);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendDailyReportTransactionsCron,
        {
          provide: DailyReportTransactionsService,
          useValue: {
            getDailyReport: async (): Promise<DailyReportDto[]> => { return []; },
          },
        },
        {
          provide: DailyReportTransactionMailEventProducer,
          useValue: {
            produceDailyReportTransactionEvent: async (dailyReportDto: DailyReportDto[]): Promise<void> => {},
          },
        },
        {
          provide: Logger,
          useValue: logger,
        },
      ],
    }).compile();

    sendDailyReportTransactionsCron = module.get(SendDailyReportTransactionsCron);
    dailyReportTransactionsService = module.get(DailyReportTransactionsService);
    dailyReportTransactionMailEventProducer = module.get(DailyReportTransactionMailEventProducer);

  });

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
  });

  afterEach(async () => {
    sandbox.restore();
    sandbox = undefined;
  });


  describe('Send daily report email', () => {
    it('should send daily report email', async () => {
      sandbox.stub(dailyReportTransactionsService, 'getDailyReport').resolves([]);
      sandbox.stub(dailyReportTransactionMailEventProducer, 'produceDailyReportTransactionEvent').withArgs([]).resolves(null);

      await sendDailyReportTransactionsCron.sendDailyReportTransaction();

      expect(dailyReportTransactionsService.getDailyReport).to.be.callCount(1);
    });
  });
});
