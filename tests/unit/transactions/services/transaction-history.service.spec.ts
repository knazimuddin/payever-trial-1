import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';
import { Logger } from '@nestjs/common';
import { TransactionHistoryService } from '../../../../src/transactions/services/transaction-history.service';
import { TransactionsService } from '../../../../src/transactions/services/transactions.service';
import { TransactionModel } from '../../../../src/transactions/models';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('TransactionHistoryService', async () => {
  let sandbox: sinon.SinonSandbox;
  let testService: TransactionHistoryService;
  let transactionsService: TransactionsService;
  let logger: Logger;

  before(() => {
    transactionsService = {
      pushHistoryRecord: (): any => { },
    } as any;

    logger = {
      log: (): any => { },
    } as any;

    testService = new TransactionHistoryService(transactionsService, logger);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('processHistoryRecord()', () => {
    it('should process history record', async () => {
      const transaction: TransactionModel = {
        items: [
          {
            id: uuid.v4(),
          },
        ],
      } as any;
      testService.processHistoryRecord(transaction, 'return', new Date(), {} as any);
    });

    it('should process history record', async () => {
      const transaction: TransactionModel = {
        items: [
          {
            id: uuid.v4(),
          },
        ],
      } as any;
      sandbox.stub(transactionsService, 'pushHistoryRecord');
      testService.processHistoryRecord(transaction, 'processed', new Date(), {} as any);
    });
  });
});
