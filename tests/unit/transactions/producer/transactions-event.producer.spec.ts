import { Test } from '@nestjs/testing';
import { RabbitMqClient } from '@pe/nest-kit';
import * as chai from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';
import { TransactionEventProducer } from '../../../../src/transactions/producer';
import { TransactionPaymentInterface, TransactionPackedDetailsInterface } from '../../../../src/transactions/interfaces/transaction';
import { RabbitRoutingKeys } from '../../../../src/enums';
import { HistoryEventActionCompletedInterface, HistoryEventDataInterface } from '../../../../src/transactions/interfaces/history-event-message';
import { TransactionModel } from '../../../../src/transactions/models';

chai.use(sinonChai);
const expect = chai.expect;

describe('PaymentMailEventProducer ', () => {
  let sandbox: sinon.SinonSandbox;
  let transactionEventProducer: TransactionEventProducer;
  let rabbitMqClient: RabbitMqClient;

  before(async () => {
    const module = await Test.createTestingModule({
      controllers: [TransactionEventProducer],
      providers: [
        {
          provide: RabbitMqClient,
          useValue: {
            send: () => { },
          },
        },
      ],
    }).compile();

    rabbitMqClient = module.get<RabbitMqClient>(RabbitMqClient);
    transactionEventProducer = module.get<TransactionEventProducer>(TransactionEventProducer);
  });

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(rabbitMqClient, 'send').resolves();
  });

  afterEach(async () => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('produceTransactionPaidEvent method', () => {
    it('should send produceTransactionPaidEvent', async () => {
      const eventName: RabbitRoutingKeys = RabbitRoutingKeys.TransactionsPaymentPaid;
      const amount: number = 100;

      const transaction: TransactionPackedDetailsInterface = {
        business_uuid: uuid.v4(),
        channel_set_uuid: uuid.v4(),
        items: [],
        updated_at: new Date(),
        uuid: uuid.v4(),
      } as any;

      const payload: TransactionPaymentInterface = {
        amount: amount,
        business: {
          id: transaction.business_uuid,
        },
        channel_set: {
          id: transaction.channel_set_uuid,
        },
        date: transaction.updated_at,
        id: transaction.uuid,
        items: transaction.items,
        last_updated: transaction.updated_at,
      };

      await transactionEventProducer.produceTransactionPaidEvent(transaction, amount, transaction.updated_at);

      expect(rabbitMqClient.send).to.have.been.calledWithMatch(
        {
          channel: eventName,
          exchange: 'async_events',
        },
        {
          name: eventName,
          payload: payload,
        },
      );
    });
  });

  describe('produceTransactionRefundEvent method', () => {
    it('should send produceTransactionRefundEvent', async () => {
      const eventName: RabbitRoutingKeys = RabbitRoutingKeys.TransactionsPaymentRefund;
      const amount: number = 100;

      const transaction: TransactionModel = {
        business_uuid: uuid.v4(),
        channel_set_uuid: uuid.v4(),
        items: [],
        updated_at: new Date(),
        uuid: uuid.v4(),
      } as any;

      const payload: TransactionPaymentInterface = {
        amount: amount,
        business: {
          id: transaction.business_uuid,
        },
        channel_set: {
          id: transaction.channel_set_uuid,
        },
        date: transaction.updated_at,
        id: transaction.uuid,
        items: transaction.items,
        last_updated: transaction.updated_at,
      };

      await transactionEventProducer.produceTransactionRefundEvent(
        transaction, amount, transaction.updated_at);

      expect(rabbitMqClient.send).to.have.been.calledWithMatch(
        {
          channel: eventName,
          exchange: 'async_events',
        },
        {
          name: eventName,
          payload: payload,
        },
      );
    });
  });

  describe('produceTransactionAddEvent method', () => {
    it('should send produceTransactionAddEvent', async () => {
      const eventName = RabbitRoutingKeys.TransactionsPaymentAdd;
      const amount: number = 100;

      const transaction: TransactionPackedDetailsInterface = {
        business_uuid: uuid.v4(),
        channel_set_uuid: uuid.v4(),
        items: [],
        updated_at: new Date(),
        uuid: uuid.v4(),
      } as any;

      const payload: TransactionPaymentInterface = {
        amount: amount,
        business: {
          id: transaction.business_uuid,
        },
        channel_set: {
          id: transaction.channel_set_uuid,
        },
        date: transaction.updated_at,
        id: transaction.uuid,
        items: transaction.items,
        last_updated: null,
      };

      await transactionEventProducer.produceTransactionAddEvent(transaction, amount);

      expect(rabbitMqClient.send).to.have.been.calledWithMatch(
        {
          exchange: 'async_events',
          channel: eventName,
        },
        {
          name: eventName,
          payload: payload,
        },
      );
    });
  });

  describe('produceTransactionSubtractEvent method', () => {
    it('should send produceTransactionSubtractEvent', async () => {
      const eventName = RabbitRoutingKeys.TransactionsPaymentSubtract;

      const transaction: TransactionModel = {
        business_uuid: uuid.v4(),
        channel_set_uuid: uuid.v4(),
        items: [],
        updated_at: new Date(),
        uuid: uuid.v4(),
      } as any;

      const refund: HistoryEventActionCompletedInterface = {
        action: 'some action',
        payment: {
          id: uuid.v4(),
          uuid: uuid.v4(),
        },
        data: {
          amount: 123.0,
        } as HistoryEventDataInterface,
      }

      const payload: TransactionPaymentInterface = {
        amount: refund.data.amount,
        business: {
          id: transaction.business_uuid,
        },
        channel_set: {
          id: transaction.channel_set_uuid,
        },
        date: transaction.updated_at,
        id: transaction.uuid,
        items: transaction.items,
        last_updated: null,
      };

      await transactionEventProducer.produceTransactionSubtractEvent(transaction, refund);

      expect(rabbitMqClient.send).to.have.been.calledWithMatch(
        {
          exchange: 'async_events',
          channel: eventName,
        },
        {
          name: eventName,
          payload: payload,
        },
      );
    });
  });

  describe('produceTransactionRemoveEvent method', () => {
    it('should send produceTransactionRemoveEvent', async () => {
      const eventName = RabbitRoutingKeys.TransactionsPaymentRemoved;

      const transaction: TransactionModel = {
        amount: 100,
        business_uuid: uuid.v4(),
        channel_set_uuid: uuid.v4(),
        items: [],
        updated_at: new Date(),
        uuid: uuid.v4(),
      } as any;

      const payload: TransactionPaymentInterface = {
        amount: transaction.amount,
        business: {
          id: transaction.business_uuid,
        },
        channel_set: {
          id: transaction.channel_set_uuid,
        },
        date: transaction.updated_at,
        id: transaction.uuid,
        items: transaction.items,
        last_updated: null,
      };

      await transactionEventProducer.produceTransactionRemoveEvent(transaction);

      expect(rabbitMqClient.send).to.have.been.calledWithMatch(
        {
          exchange: 'async_events',
          channel: eventName,
        },
        {
          name: eventName,
          payload: payload,
        },
      );
    });
  });
});
