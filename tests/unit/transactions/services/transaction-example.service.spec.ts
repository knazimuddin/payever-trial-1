import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';
import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { TransactionExampleModel, TransactionModel } from '../../../../src/transactions/models';
import { TransactionsExampleService } from '../../../../src/transactions/services/transactions-example.service';
import { NotificationsEmitter } from '@pe/notifications-sdk';
import { TransactionEventProducer } from '../../../../src/transactions/producer';
import { RabbitMqClient } from '@pe/nest-kit';
import { TransactionsService } from '../../../../src/transactions/services/transactions.service';
import { BusinessDto } from '../../../../src/transactions/dto';
import { RabbitRoutingKeys } from '../../../../src/enums';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('TransactionsExampleService', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: TransactionsExampleService;
  let transactionExampleModel: Model<TransactionExampleModel>;
  let notificationsEmitter: NotificationsEmitter;
  let transactionsService: TransactionsService;
  let transactionEventProducer: TransactionEventProducer;
  let rabbitClient: RabbitMqClient;

  before(() => {
    transactionExampleModel = {
      find: (): any => { },
    } as any;

    transactionsService = {
      create: (): any => { },
      findCollectionByParams: (): any => { },
      removeByUuid: (): any => { },
    } as any;

    rabbitClient = {
      send: (): any => { },
    } as any;

    transactionEventProducer = {
      produceTransactionRemoveEvent: (): any => { },
    } as any;

    transactionExampleModel = {
      find: (): any => { },
    } as any;

    testService = new TransactionsExampleService(
      transactionExampleModel,
      notificationsEmitter,
      transactionsService,
      transactionEventProducer,
      rabbitClient,
    );

  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('createBusinessExample()', () => {
    it('should create busnesss Examples', async () => {
      const dto: BusinessDto = {
        _id: uuid.v4(),
        companyAddress: {
          country: 'DE',
        },
        currency: 'EUR',
        name: 'Business Name',
        contactEmails: ['narayan@payever.de'],
      } as any;

      const examples: TransactionExampleModel[] = [
        {
          toObject(): any { return this },
          _id: uuid.v4(),
        },
        {
          toObject(): any { return this },
          _id: uuid.v4(),
        },
      ] as TransactionExampleModel[];

      const transaction: TransactionModel = {
        amount: 123,
        business_uuid: uuid.v4(),
        channel_set_uuid: uuid.v4(),
        updated_at: new Date('2020-10-19'),
        uuid: uuid.v4(),
      } as TransactionModel;
      sandbox.stub(transactionExampleModel, 'find').resolves(examples);
      sandbox.stub(transactionsService, 'create').resolves(transaction);
      sandbox.spy(rabbitClient, 'send');

      await testService.createBusinessExamples(dto)

      expect(transactionsService.create).calledTwice;
      expect(rabbitClient.send).calledTwice;
      expect(rabbitClient.send).calledWith(
        {
          channel: RabbitRoutingKeys.TransactionsPaymentAdd,
          exchange: 'async_events',
        },
      );
    });
  });

  describe('removeBusinessExamples()', () => {
    it('should remove business transactions examples', async () => {
      const transactions: TransactionModel[] = [
        {
          _id: 'ed376e5e-b954-4eb1-83a1-9b174e512441',
          business_uuid: '4b94f63b-fe21-4a97-9288-07583cb74d67',
          uuid: '5fe5f561-fdad-4634-ad3e-8fe72b649d93',
        },
      ] as TransactionModel[];
      sandbox.stub(transactionsService, 'findCollectionByParams').resolves(transactions);
      sandbox.spy(transactionsService, 'removeByUuid');
      sandbox.spy(transactionEventProducer, 'produceTransactionRemoveEvent');

      await testService.removeBusinessExamples('4b94f63b-fe21-4a97-9288-07583cb74d67');

      expect(transactionsService.removeByUuid).calledOnceWith(transactions[0].uuid);
      expect(transactionEventProducer.produceTransactionRemoveEvent).calledOnceWith(transactions[0]);

    });
  });

  describe('refundExample()', () => {
    it('should send rabbit message', async () => {
      const transaction: TransactionModel = {
        amount: 123,
        business_uuid: uuid.v4(),
        channel_set_uuid: uuid.v4(),
        updated_at: new Date('2020-10-19'),
        uuid: uuid.v4(),
      } as TransactionModel;
      const refund: number = 123;
      sandbox.spy(rabbitClient, 'send')
      await testService.refundExample(transaction, refund);


      expect(rabbitClient.send).calledWith(
        {
          channel: RabbitRoutingKeys.TransactionsPaymentSubtract,
          exchange: 'async_events',
        },
        {
          name: RabbitRoutingKeys.TransactionsPaymentSubtract,
          payload: {
            amount: refund,
            business: {
              id: transaction.business_uuid,
            },
            channel_set: {
              id: transaction.channel_set_uuid,
            },
            date: transaction.updated_at,
            id: transaction.uuid,
            items: transaction.items,
          },
        },
      )
    });
  });
});
