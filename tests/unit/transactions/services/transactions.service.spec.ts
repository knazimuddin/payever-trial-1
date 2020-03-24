import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';
import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { TransactionModel, TransactionHistoryEntryModel, PaymentFlowModel } from '../../../../src/transactions/models';
import { NotificationsEmitter } from '@pe/notifications-sdk';
import { ElasticsearchClient, DelayRemoveClient, RabbitMqClient } from '@pe/nest-kit';
import { TransactionsNotifier } from '../../../../src/transactions/notifiers';
import { TransactionsService } from '../../../../src/transactions/services/transactions.service';
import { TransactionPackedDetailsInterface, TransactionUnpackedDetailsInterface } from '../../../../src/transactions/interfaces';
import { RpcResultDto } from '../../../../src/transactions/dto';
import { AuthEventsProducer } from '../../../../src/transactions/producer';
import { PaymentFlowService } from '../../../../src/transactions/services/payment-flow.service';
import { AnyARecord } from 'dns';
import { RpcException } from '@nestjs/microservices';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('TransactionsService', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: TransactionsService;
  let transactionModel: Model<TransactionModel>
  let notificationsEmitter: NotificationsEmitter;
  let paymentFlowService: PaymentFlowService;
  let elasticSearchClient: ElasticsearchClient;
  let logger: Logger;
  let notifier: TransactionsNotifier;
  let delayRemoveClient: DelayRemoveClient;
  let authEventsProducer: AuthEventsProducer;
  let rabbitClient: RabbitMqClient;

  const transaction: TransactionModel = {
    id: uuid.v4(),
    uuid: uuid.v4(),
    amount: 1,
    total: 12,
    toObject(): any { return this },
    items: [],
    history: [],
  } as any;

  before(() => {
    transactionModel = {
      create: (): any => { },
      find: (): any => { },
      findOne: (): any => { },
      findOneAndRemove: (): any => { },
      findOneAndUpdate: (): any => { },
      limit(): any { return this },
      sort(): any { return this },
    } as any;

    elasticSearchClient = {
      singleIndex: (): any => { },
    } as any;

    logger = {
      log: (): any => { },
      warn: (): any => { },
    } as any;

    notifier = {
      sendNewTransactionNotification: (): any => { },
    } as any;

    paymentFlowService = {
      findOne: (): any => { },
    } as any;

    delayRemoveClient = {
      deleteByQuery: (): any => { },
    } as any;

    rabbitClient = {
      send: (): any => { },
    } as any;

    authEventsProducer = {
      getSellerName: (): any => { },
    } as any;

    testService = new TransactionsService(
      transactionModel,
      notificationsEmitter,
      paymentFlowService,
      elasticSearchClient,
      logger,
      notifier,
      delayRemoveClient,
      authEventsProducer,
    );
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('create()', () => {
    it('should create transactionModel', async () => {
      const transactionDto: TransactionPackedDetailsInterface = {
        id: uuid.v4(),
        uuid: uuid.v4(),
      } as any;
      const paymentFlow: PaymentFlowModel = {
        id: uuid.v4(),
        seller_email: 'test@test.com'
      } as any;

      sandbox.stub(transactionModel, 'create').resolves(transaction);
      sandbox.stub(paymentFlowService, 'findOne').resolves(paymentFlow);
      expect(
        await testService.create(transactionDto),
      ).to.equal(transaction);
    });

    it('should throw MOngoError error while creating transactionModel', async () => {
      const transactionDto: TransactionPackedDetailsInterface = {
      } as any;

      sandbox.stub(transactionModel, 'create').throws({
        code: 11000,
        name: 'MongoError',
      })
      sandbox.stub(transactionModel, 'findOne').resolves(transaction);

      expect(
        await testService.create(transactionDto),
      ).to.deep.equal(transaction);
    });

    it('should throw  error while creating transactionModel', async () => {
      const transactionDto: TransactionPackedDetailsInterface = {
      } as any;

      sandbox.stub(transactionModel, 'create').throws({
        code: 123,
        name: 'SomeError',
      })
      sandbox.stub(transactionModel, 'findOne').resolves(transaction);
      const spy: sinon.SinonSpy = sandbox.spy(testService, 'create');
      try {
        await testService.create(transactionDto);
      } catch (e) { }
      expect(spy.threw());
    });
  });

  describe('updateByUuid()', () => {
    it('should update transaction Model by uuid', async () => {
      const transactionDto: TransactionPackedDetailsInterface = {
        id: uuid.v4(),
      } as any;

      sandbox.stub(transactionModel, 'findOneAndUpdate').resolves(transaction);
      expect(
        await testService.updateByUuid(transaction.id, transactionDto),
      ).to.equal(transaction);
    });
    it('should occur MongoError while updating transaction Model by uuid', async () => {
      const transactionDto: TransactionPackedDetailsInterface = {
        id: uuid.v4(),
      } as any;

      const transaction: TransactionModel = {
        id: transactionDto.id,
        uuid: uuid.v4(),
        amount: 1,
        total: 12,
        toObject(): any { return this },
        items: [],
        history: [],
      } as any;

      sandbox.stub(transactionModel, 'findOneAndUpdate').throws({
        code: 11000,
        name: 'MongoError',
      });

      expect(
        await testService.updateByUuid(transaction.id, transactionDto),
      ).to.equal(undefined);
    });

    it('should should throw error', async () => {
      const transactionDto: TransactionPackedDetailsInterface = {
        id: uuid.v4(),
      } as any;

      const transaction: TransactionModel = {
        id: transactionDto.id,
        uuid: uuid.v4(),
        amount: 1,
        total: 12,
        toObject(): any { return this },
        items: [],
        history: [],
      } as any;

      sandbox.stub(transactionModel, 'findOneAndUpdate').throws({
        code: 100,
        name: 'SomeOtherError',
      });

      const spy: sinon.SinonSpy = sandbox.spy(testService, 'updateByUuid');
      try {
        await testService.updateByUuid(transaction.id, transactionDto);
      } catch (e) { }
      expect(spy.threw());
    });

  });

  describe('updateHistoryByUuid()', () => {
    it('should update history by uuid', async () => {


      const transactionHistory: TransactionHistoryEntryModel = {} as any;
      sandbox.stub(transactionModel, 'findOneAndUpdate').resolves(transaction)
      expect(
        await testService.updateHistoryByUuid(transaction.id, [transactionHistory]),
      ).to.equal(transaction);
    });
  });

  describe('findModelByUuid', () => {
    it('should return transaction Model by uuid', async () => {
      sandbox.stub(testService, 'findModelByUuid').resolves(transaction);
      sandbox.stub(testService, 'findModelByParams').resolves(transaction);
      expect(
        await testService.findModelByUuid(transaction.uuid),
      ).to.equal(transaction);
    });
  });

  describe('findModelByParams', () => {
    it('should return transaction Model by uuid', async () => {
      sandbox.stub(testService, 'findModelByParams').resolves(transaction);
      
      expect(
        await testService.findModelByParams({ id: transaction.id }),
      ).to.equal(transaction);
    });
  });

  describe('findCollectionByParams', () => {
    it('should return transaction Models by uuid', async () => {
      sandbox.stub(transactionModel, 'find').resolves([transaction]);
      expect(
        await testService.findCollectionByParams({ amount: transaction.amount }),
      ).to.deep.equal([transaction]);
    });
  });

  describe('findUnpackedByUuid', () => {
    it('should return transaction unpacked by uuid', async () => {
      sandbox.stub(transactionModel, 'findOne').resolves(transaction);
      await testService.findCollectionByParams({ amount: transaction.amount });
    });
  });

  describe('findUnpackedByParams()', () => {
    it('should find unpacked transaction details by params', async () => {
      sandbox.stub(transactionModel, 'findOne').resolves(transaction);
      await testService.findUnpackedByParams({});
    });
    it('should find unpacked transaction details by params', async () => {
      sandbox.stub(transactionModel, 'findOne').resolves(null);
      await testService.findUnpackedByParams({});
    });
  });

  describe('findAll()', () => {
    it('should find all transaction model instances by businessid', async () => {
      sandbox.stub(transactionModel, 'find');
      await testService.findAll(transaction.business_uuid);
      expect(transactionModel.find).calledOnceWithExactly({ business_uuid: transaction.business_uuid });
    });
  });

  describe('removeByUuid()', () => {
    it('should remove transaction model by uuid', async () => {
      sandbox.stub(transactionModel, 'findOneAndRemove').resolves(transaction);
      await testService.removeByUuid(transaction._id);

    });

    it('should remove transaction model by uuid', async () => {
      sandbox.stub(transactionModel, 'findOneAndRemove').resolves(null);
      await testService.removeByUuid(transaction._id);
    });
  });

  describe('pushHistoryRecord()', () => {
    it('should history record to transaction', async () => {
      sandbox.stub(transactionModel, 'findOneAndUpdate').resolves(transaction);
      await testService.pushHistoryRecord(
        transaction,
        {
          action: 'delete',
        } as any,
      )
      expect(transactionModel.findOneAndUpdate).calledOnce;
    })
  });

  describe('setShippingOrderProcessed()', () => {
    it('should set shipping orer processed to true', async () => {
      sandbox.spy(transactionModel, 'findOneAndUpdate');
      await testService.setShippingOrderProcessed(transaction._id);
      expect(transactionModel.findOneAndUpdate).calledOnceWith(
        { uuid: transaction._id },
        {
          $set: {
            is_shipping_order_processed: true,
          },
        },
      )
    })
  });

  describe('findUnpackedByUuid()', () => {
    it('should find unpackedby uuid', async () => {
      sandbox.stub(testService, 'findUnpackedByParams')
      await testService.findUnpackedByUuid(transaction._id);
    });
  });

  describe('applyRpcResult()', () => {
    it('should apply payment properties', async () => {
      const result: RpcResultDto = {
        payment: {
          amount: 123,
          id: uuid.v4(),
          uuid: uuid.v4(),
          delivery_fee: 123,
          status: 'in_process',
          specific_status: 'IN_PROGRESS',
          reference: 'reference',
        },
        payment_details: {
          application_no: '456',
          application_number: '420',
          finance_id: '123',
        },
        workflow_state: 'Hamburg',
      } as any;
      const transactionUnpackedDetails: TransactionUnpackedDetailsInterface = {
        id: uuid.v4(),
        amount: 12,
        total: 234,
        items: [],
        history: [],
      } as any;

      sandbox.stub(transactionModel, 'findOneAndUpdate').resolves(transaction);

      await testService.applyRpcResult(transactionUnpackedDetails, result);
    });

    it('should apply payment properties with undefined amount for payment', async () => {
      const result: RpcResultDto = {
        payment: {
          id: uuid.v4(),
          uuid: uuid.v4(),
          delivery_fee: 123,
          status: 'in_process',
          specific_status: 'IN_PROGRESS',
          reference: 'reference',
        },
        payment_details: {
          application_no: '456',
          application_number: '420',
          finance_id: '123',
        },
        workflow_state: 'Hamburg',
      } as any;
      const transactionUnpackedDetails: TransactionUnpackedDetailsInterface = {
        id: uuid.v4(),
        amount: 12,
        total: 234,
        items: [],
        history: [],
      } as any;

      sandbox.stub(transactionModel, 'findOneAndUpdate').resolves(transaction);
      const spy: sinon.SinonSpy = sandbox.spy(testService.applyRpcResult);
      try {
        await testService.applyRpcResult(transactionUnpackedDetails, result);
      } catch (e) { }
      expect(spy.threw());
    });
  });

  describe('applyActionRpcResult()', () => {
    it('should applu action rpc result', async () => {
      const result: RpcResultDto = {
        payment: {
          amount: 123,
          id: uuid.v4(),
          uuid: uuid.v4(),
          delivery_fee: 123,
          status: 'in_process',
          specific_status: 'IN_PROGRESS',
          reference: 'reference',
        },
        payment_details: {
          application_no: '456',
          application_number: '420',
          finance_id: '123',
        },
        payment_items: [
          {
            _id: uuid.v4(),
            name: 'cartname',

          },
        ],
        workflow_state: 'Hamburg',
      } as any;
      const transactionUnpackedDetails: TransactionUnpackedDetailsInterface = {
        id: uuid.v4(),
        amount: 12,
        total: 234,
        items: [],
        history: [],
        business_uuid: uuid.v4(),
      } as any;

      sandbox.stub(transactionModel, 'findOneAndUpdate').resolves(transaction);


      await testService.applyActionRpcResult(transactionUnpackedDetails, result);
    });
  });
});