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

describe('StatisticsService', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: StatisticsService;
  let transactionEventProducer: TransactionEventProducer;
  let transactionModel: Model<TransactionModel>;

  let query: DocumentQuery<TransactionModel, TransactionModel, {}> = {
    lean: (): any => { },
  } as any;

  const transactionsADD: TransactionModel = {
    _id: 'ed376e5e-b954-4eb1-83a1-9b174e512441',
    business_uuid: '4b94f63b-fe21-4a97-9288-07583cb74d67',
    status: 'STATUS_ADD',
    uuid: '5fe5f561-fdad-4634-ad3e-8fe72b649d93',
  } as TransactionModel;

  const transactionsPAID: TransactionModel = {
    _id: 'ed376e5e-b954-4eb1-83a1-9b174e512441',
    business_uuid: '4b94f63b-fe21-4a97-9288-07583cb74d67',
    status: 'STATUS_PAID',
    uuid: '5fe5f561-fdad-4634-ad3e-8fe72b649d93',
    updated_at: new Date('2020-11-10'),
  } as TransactionModel;

  const transactionDtoACCEPTED: TransactionPackedDetailsInterface = {
    id: uuid.v4(),
    uuid: uuid.v4(),
    status: 'STATUS_ACCEPTED',
    amount: 100,
    updated_at: new Date('2020-11-10'),
  } as any;

  const transactionDtoREFUND: TransactionPackedDetailsInterface = {
    id: uuid.v4(),
    uuid: uuid.v4(),
    status: 'STATUS_REFUNDED',
    history: [
      {
        action: 'refund',
        amount: 100,
      },
    ],
    updated_at: new Date('2020-11-10')
  } as any;


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

  before(() => {
    transactionModel = {
      create: (): any => { },
      findOne: (): any => { },
      findOneAndRemove: (): any => { },
      findOneAndUpdate: (): any => { },
    } as any;

    transactionEventProducer = {
      produceInternalTransactionRefundEvent: (): any => { },
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

      sandbox.stub(transactionModel, 'findOne').returns(query);
      sandbox.stub(query, 'lean').resolves(transactionsADD);

      sandbox.spy(transactionEventProducer, 'produceTransactionAddEvent');

      await testService.processAcceptedTransaction('5fe5f561-fdad-4634-ad3e-8fe72b649d93', transactionDtoACCEPTED);
      expect(transactionEventProducer.produceTransactionAddEvent).calledOnceWith(transactionDtoACCEPTED, transactionDtoACCEPTED.amount);

    });

    it('should no process accepted transaction', async () => {

      sandbox.stub(transactionModel, 'findOne').returns(query);
      sandbox.stub(query, 'lean').resolves(null);

      sandbox.spy(transactionEventProducer, 'produceTransactionAddEvent');

      await testService.processAcceptedTransaction('5fe5f561-fdad-4634-ad3e-8fe72b649d93', transactionDtoACCEPTED);
      expect(transactionEventProducer.produceTransactionAddEvent).to.not.called;

    });

    it('should no process accepted transaction status test', async () => {

      const transactionDtoTEST: TransactionPackedDetailsInterface = {
        id: uuid.v4(),
        uuid: uuid.v4(),
        status: 'STATUS_TEST',
        amount: 100
      } as any;

      sandbox.stub(transactionModel, 'findOne').returns(query);
      sandbox.stub(query, 'lean').resolves(transactionDtoACCEPTED);

      sandbox.spy(transactionEventProducer, 'produceTransactionAddEvent');

      await testService.processAcceptedTransaction('5fe5f561-fdad-4634-ad3e-8fe72b649d93', transactionDtoTEST);
      expect(transactionEventProducer.produceTransactionAddEvent).to.not.called;

    });
  });

  describe('processMigratedTransaction()', () => {
    it('should process successfully migrated transaction ACCEPTED', async () => {

      sandbox.spy(transactionEventProducer, 'produceTransactionAddEvent');

      await testService.processMigratedTransaction(transactionDtoACCEPTED);
      expect(transactionEventProducer.produceTransactionAddEvent).calledOnceWith(transactionDtoACCEPTED, transactionDtoACCEPTED.amount);

    });

    it('should process successfully migrated transaction PAID', async () => {

      const transactionDto: TransactionPackedDetailsInterface = {
        id: uuid.v4(),
        uuid: uuid.v4(),
        status: 'STATUS_PAID',
        amount: 100
      } as any;

      sandbox.spy(transactionEventProducer, 'produceTransactionAddEvent');

      await testService.processMigratedTransaction(transactionDto);
      expect(transactionEventProducer.produceTransactionAddEvent).calledOnceWith(transactionDto, transactionDto.amount);

    });

    it('should process successfully migrated transaction REFUND history', async () => {

      const transactionDto: TransactionPackedDetailsInterface = {
        id: uuid.v4(),
        uuid: uuid.v4(),
        status: 'STATUS_REFUNDED',
        amount: 100,
        history: [
          {
            action: "refund",
            amount: 50,
          },
          {
            action: "some_action",
            amount: 50,
          },
        ]
      } as any;

      sandbox.spy(transactionEventProducer, 'produceTransactionAddEvent');

      await testService.processMigratedTransaction(transactionDto);
      expect(transactionEventProducer.produceTransactionAddEvent).calledOnceWith(transactionDto, 50);

    });

    it('should process successfully migrated transaction REFUND no history', async () => {

      const transactionDto: TransactionPackedDetailsInterface = {
        id: uuid.v4(),
        uuid: uuid.v4(),
        status: 'STATUS_REFUNDED',
        amount: 100,
        history: [],
      } as any;

      sandbox.spy(transactionEventProducer, 'produceTransactionAddEvent');

      await testService.processMigratedTransaction(transactionDto);
      expect(transactionEventProducer.produceTransactionAddEvent).calledOnceWith(transactionDto, transactionDto.amount);

    });

    it('should no process migrated transaction', async () => {

      const transactionDto: TransactionPackedDetailsInterface = {
        id: uuid.v4(),
        uuid: uuid.v4(),
        status: 'STATUS_TEST',
        amount: 100
      } as any;

      sandbox.spy(transactionEventProducer, 'produceTransactionAddEvent');

      await testService.processMigratedTransaction(transactionDto);
      expect(transactionEventProducer.produceTransactionAddEvent).to.not.called;

    });
  });

  describe('processRefundedTransaction()', () => {
    it('should process successfully refund transaction', async () => {

      sandbox.stub(transactionModel, 'findOne').returns(query);
      sandbox.stub(query, 'lean').resolves(transactionsADD);

      sandbox.spy(transactionEventProducer, 'produceTransactionSubtractEvent');

      await testService.processRefundedTransaction('5fe5f561-fdad-4634-ad3e-8fe72b649d93', refund);
      expect(transactionEventProducer.produceTransactionSubtractEvent).calledOnceWith(transactionsADD, refund);

    });

    it('should no process refund transaction', async () => {

      sandbox.stub(transactionModel, 'findOne').returns(query);
      sandbox.stub(query, 'lean').resolves(null);

      sandbox.spy(transactionEventProducer, 'produceTransactionSubtractEvent');

      await testService.processRefundedTransaction('5fe5f561-fdad-4634-ad3e-8fe72b649d93', refund);
      expect(transactionEventProducer.produceTransactionSubtractEvent).to.not.called;

    });

    it('should no process refund transaction', async () => {

      const refundSome: HistoryEventActionCompletedInterface = {
        action: 'someaction',
        payment: {
          id: uuid.v4(),
          uuid: uuid.v4(),
        },
        data: {
          amount: 123.0,
        } as HistoryEventDataInterface,
      }

      sandbox.stub(transactionModel, 'findOne').returns(query);
      sandbox.stub(query, 'lean').resolves(transactionsADD);

      sandbox.spy(transactionEventProducer, 'produceTransactionSubtractEvent');

      await testService.processRefundedTransaction('5fe5f561-fdad-4634-ad3e-8fe72b649d93', refundSome);
      expect(transactionEventProducer.produceTransactionSubtractEvent).to.not.called;

    });
  });

  describe('processRefundedTransactionAfterPaid()', () => {
    it('should process successfully refund transaction after paid', async () => {

      sandbox.stub(transactionModel, 'findOne').returns(query);
      sandbox.stub(query, 'lean').resolves(transactionsPAID);

      sandbox.spy(transactionEventProducer, 'produceInternalTransactionRefundEvent');

      await testService.processRefundedTransactionAfterPaid(
        '5fe5f561-fdad-4634-ad3e-8fe72b649d93', transactionDtoREFUND);
      expect(transactionEventProducer.produceInternalTransactionRefundEvent).calledOnceWith(
        transactionDtoREFUND, transactionDtoREFUND.updated_at);

    });

    it('should process refund transaction but doesn send message', async () => {

      sandbox.stub(transactionModel, 'findOne').returns(query);
      sandbox.stub(query, 'lean').resolves(transactionDtoACCEPTED);

      sandbox.spy(transactionEventProducer, 'produceInternalTransactionRefundEvent');

      await testService.processRefundedTransactionAfterPaid(
        '5fe5f561-fdad-4634-ad3e-8fe72b649d93', transactionDtoREFUND);
      expect(transactionEventProducer.produceInternalTransactionRefundEvent).to.not.called;
    });

  });

});
