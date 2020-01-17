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
        } as any,
      ]

      const transaction: TransactionModel = {
        amount: 123,
        business_uuid: uuid.v4(),
        channel_set_uuid: uuid.v4(),
        updated_at: new Date(),
        uuid: uuid.v4(),
      } as any;
      sandbox.stub(transactionExampleModel, 'find').resolves(examples);
      sandbox.stub(transactionsService, 'create').resolves(transaction);
      testService.createBusinessExamples(dto)
    });
  });

  describe('removeBusinessExamples()', () => {
    it('should remove business transactions examples', async () => {
      const transactions: TransactionModel[] = [
        {
          _id: uuid.v4(),
        },
      ] as any;
      sandbox.stub(transactionsService, 'findCollectionByParams').resolves(transactions);
      await testService.removeBusinessExamples(uuid.v4());
    });
  });

  describe('refundExample()', () => {
    it('should send rabbit message', async () => {
      await testService.refundExample({} as any, 12);
    });
  });
});
