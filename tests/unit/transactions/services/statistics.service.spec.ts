import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';
import { Model, DocumentQuery } from 'mongoose';
import { StatisticsService } from '../../../../src/transactions/services/statistics.service';
import { TransactionModel } from '../../../../src/transactions/models';
import { TransactionEventProducer } from '../../../../src/transactions/producer';
import { TransactionPackedDetailsInterface } from '../../../../src/transactions/interfaces';
import { HistoryEventActionCompletedInterface, HistoryEventDataInterface } from '../../../../src/transactions/interfaces/history-event-message';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('PaymentFlowService', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: StatisticsService;
  let transactionEventProducer: TransactionEventProducer;
  let transactionModel: Model<TransactionModel>;

  before(() => {
    transactionModel = {
      create: (): any => { },
      findOne: (): any => { },
      findOneAndRemove: (): any => { },
      findOneAndUpdate: (): any => { },
    } as any;

    transactionEventProducer = {
      produceTransactionAddEvent: (): any => { },
      produceTransactionRemoveEvent: (): any => { },
      produceTransactionSubtractEvent: (): any => { },
    } as any;

    testService = new StatisticsService(transactionModel, transactionEventProducer);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  
  describe('processAcceptedTransaction()', () => {
    it('should process successfully accepted transaction', async () => {

      const transactionDto: TransactionPackedDetailsInterface = {
        id: uuid.v4(),
        uuid: uuid.v4(),
        status: 'STATUS_ACCEPTED',
        amount: 100
      } as any;

      const transactions: TransactionModel = {
          _id: 'ed376e5e-b954-4eb1-83a1-9b174e512441',
          business_uuid: '4b94f63b-fe21-4a97-9288-07583cb74d67',
          status: 'STATUS_ADD',
          uuid: '5fe5f561-fdad-4634-ad3e-8fe72b649d93',
      } as TransactionModel;

      let query: DocumentQuery<TransactionModel, TransactionModel, {}> = {
        lean: (): any => { },
      } as any;

      sandbox.stub(transactionModel, 'findOne').returns(query);
      sandbox.stub(query, 'lean').resolves(transactions);

      sandbox.spy(transactionEventProducer, 'produceTransactionAddEvent');

      await testService.processAcceptedTransaction('5fe5f561-fdad-4634-ad3e-8fe72b649d93', transactionDto);
      expect(transactionEventProducer.produceTransactionAddEvent).calledOnceWith(transactionDto, transactionDto.amount);

    });

    it('should no process accepted transaction', async () => {

      const transactionDto: TransactionPackedDetailsInterface = {
        id: uuid.v4(),
        uuid: uuid.v4(),
        status: 'STATUS_ACCEPTED',
        amount: 100
      } as any;

      let query: DocumentQuery<TransactionModel, TransactionModel, {}> = {
        lean: (): any => { },
      } as any;

      sandbox.stub(transactionModel, 'findOne').returns(query);
      sandbox.stub(query, 'lean').resolves(null);

      sandbox.spy(transactionEventProducer, 'produceTransactionAddEvent');

      await testService.processAcceptedTransaction('5fe5f561-fdad-4634-ad3e-8fe72b649d93', transactionDto);
      expect(transactionEventProducer.produceTransactionAddEvent).to.not.called;

    });
  });

  describe('processRefundedTransaction()', () => {
    it('should process successfully refund transaction', async () => {

      const refund: HistoryEventActionCompletedInterface = {
        action: 'refund',
        payment: {
          id: uuid.v4(),
          uuid: uuid.v4(),
        },
        data: {
          amount: 123.0,
        } as HistoryEventDataInterface,
      }

      const transactions: TransactionModel = {
          _id: 'ed376e5e-b954-4eb1-83a1-9b174e512441',
          business_uuid: '4b94f63b-fe21-4a97-9288-07583cb74d67',
          status: 'STATUS_ADD',
          uuid: '5fe5f561-fdad-4634-ad3e-8fe72b649d93',
      } as TransactionModel;

      let query: DocumentQuery<TransactionModel, TransactionModel, {}> = {
        lean: (): any => { },
      } as any;

      sandbox.stub(transactionModel, 'findOne').returns(query);
      sandbox.stub(query, 'lean').resolves(transactions);

      sandbox.spy(transactionEventProducer, 'produceTransactionSubtractEvent');

      await testService.processRefundedTransaction('5fe5f561-fdad-4634-ad3e-8fe72b649d93', refund);
      expect(transactionEventProducer.produceTransactionSubtractEvent).calledOnceWith(transactions, refund);

    });

    it('should no process refund transaction', async () => {

      const refund: HistoryEventActionCompletedInterface = {
        action: 'refund',
        payment: {
          id: uuid.v4(),
          uuid: uuid.v4(),
        },
        data: {
          amount: 123.0,
        } as HistoryEventDataInterface,
      }

      let query: DocumentQuery<TransactionModel, TransactionModel, {}> = {
        lean: (): any => { },
      } as any;

      sandbox.stub(transactionModel, 'findOne').returns(query);
      sandbox.stub(query, 'lean').resolves(null);

      sandbox.spy(transactionEventProducer, 'produceTransactionSubtractEvent');

      await testService.processRefundedTransaction('5fe5f561-fdad-4634-ad3e-8fe72b649d93', refund);
      expect(transactionEventProducer.produceTransactionSubtractEvent).to.not.called;

    });
  });
  
});
