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
import { ElasticsearchClient, DelayRemoveClient } from '@pe/nest-kit';
import { TransactionsNotifier } from '../../../../src/transactions/notifiers';
import { TransactionsService } from '../../../../src/transactions/services/transactions.service';
import { TransactionPackedDetailsInterface, TransactionUnpackedDetailsInterface } from '../../../../src/transactions/interfaces';
import { RpcResultDto } from '../../../../src/transactions/dto';
import { AuthEventsProducer } from '../../../../src/transactions/producer';
import { PaymentFlowService } from '../../../../src/transactions/services/payment-flow.service';
import { AnyTxtRecord } from 'dns';
import { ElasticTransactionEnum } from '../../../../src/transactions/enum';

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

  const transaction: TransactionModel = {
    id: '4416ed60-93e4-4557-a4e8-5e57140ee88b',
    original_id: '627a3236-af6c-444a-836c-9f0d1d27c21a',
    uuid: '55da9ea8-5b56-42e3-8d68-f24bb052a8a1',
    amount: 100,
    amount_refunded: 50,
    amount_rest: 40,
    available_refund_items: [],
    billing_address: {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    },
    business_option_id: 12345,
    business_uuid: 'd82bd863-26e5-4182-9a6b-f1dcc8507cb1',
    channel: 'channel_1',
    channel_set_uuid: 'c8cbcf36-032a-4ce7-a285-3df691c946f5',
    created_at: new Date('2020-12-12'),
    currency: 'EUR',
    customer_email: 'narayan@payever.de',
    customer_name: 'Narayan Ghimire',
    delivery_fee: 2.99,
    down_payment: 30,
    fee_accepted: true,
    history: [],
    is_shipping_order_processed: true,
    items: [],
    merchant_email: 'merchant@payever.de',
    merchant_name: 'Merchant Doe',
    payment_details: {},
    payment_fee: 2,
    payment_flow_id: '67d3e998-8c6e-444f-9b5b-b2f38e8d532e',
    place: 'Bremen',
    reference: 'Reference 1',
    santander_applications: [],
    shipping_address: {},
    shipping_option_name: 'shipping_option_1',
    shipping_order_id: '8ca31b1f-87d0-4981-93e9-8c62d0de1e94',
    specific_status: 'ACCEPTED',
    status: 'PENDING',
    status_color: 'yellow',
    store_id: '1b42fd1c-3b28-47cf-b7fb-01c4281dc7f7',
    store_name: 'XYZ Store',
    total: 200,
    type: 'type_1',
    updated_at: new Date('2020-12-12'),
    user_uuid: '6c08ca77-abb6-4d07-ae83-24653ea94a14',
    example: false,
    example_shipping_label: 'example_shipping_label_1',
    example_shipping_slip: 'example_shipping_slip_1',
    toObject(): any { return this },
    save(): any { },
  } as TransactionModel;

  const flow: PaymentFlowModel = {
    seller_email: 'seller@email.com',
  } as PaymentFlowModel;

  before(() => {
    transactionModel = {
      create: (): any => { },
      find: (): any => { },
      findOne: (): any => { },
      findOneAndRemove: (): any => { },
      findOneAndUpdate: (): any => { },
    } as any;

    paymentFlowService = {
      findOne: (): any => { },
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

    delayRemoveClient = {
      deleteByQuery: (): any => { },
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

      sandbox.stub(transactionModel, 'create').resolves(transaction);
      sandbox.stub(paymentFlowService, 'findOne').resolves(flow);
      sandbox.spy(notifier, 'sendNewTransactionNotification');
      sandbox.spy(authEventsProducer, 'getSellerName');

      expect(
        await testService.create(transactionDto),
      ).to.equal(transaction);
      expect(
        notifier.sendNewTransactionNotification,
      ).calledOnceWithExactly(transaction);

      expect(authEventsProducer.getSellerName).calledOnceWith({ email: 'seller@email.com' });
    });

    it('should throw MOngoError error while creating transactionModel', async () => {
      const transactionDto: TransactionPackedDetailsInterface = {
      } as any;

      sandbox.stub(paymentFlowService, 'findOne').resolves(flow);
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

      sandbox.stub(paymentFlowService, 'findOne').resolves(flow);
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

      sandbox.stub(paymentFlowService, 'findOne').resolves(flow);
      sandbox.stub(transactionModel, 'findOneAndUpdate').resolves(transaction);
      sandbox.stub(elasticSearchClient, 'singleIndex');
      expect(
        await testService.updateByUuid(transaction.id, transactionDto),
      ).to.equal(transaction);

      expect(transactionModel.findOneAndUpdate).calledOnce;
      expect(elasticSearchClient.singleIndex).calledOnce;

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

      sandbox.stub(paymentFlowService, 'findOne').resolves(flow);
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

      sandbox.stub(paymentFlowService, 'findOne').resolves(flow);
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
      sandbox.stub(transactionModel, 'findOne').resolves(transaction);
      expect(
        await testService.findModelByUuid(transaction.uuid),
      ).to.equal(transaction);
    });
  });

  describe('findModelByParams', () => {
    it('should return transaction Model by uuid', async () => {
      sandbox.stub(transactionModel, 'findOne').resolves(transaction);
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
      sandbox.stub(testService, 'findUnpackedByUuid');

      await testService.findUnpackedByUuid(transaction.uuid);
      expect(testService.findUnpackedByUuid).calledOnce
    });
  });

  describe('findUnpackedByParams()', () => {
    it('should find unpacked transaction details by params', async () => {
      sandbox.stub(transactionModel, 'findOne').resolves(transaction);
      const result: TransactionUnpackedDetailsInterface = await testService.findUnpackedByParams({});
      expect(result).to.deep.equal(
        {
          id: '4416ed60-93e4-4557-a4e8-5e57140ee88b',
          original_id: '627a3236-af6c-444a-836c-9f0d1d27c21a',
          uuid: '55da9ea8-5b56-42e3-8d68-f24bb052a8a1',
          action_running: undefined,
          amount: 100000000,
          amount_refunded: 50,
          amount_rest: 40,
          available_refund_items: [],
          billing_address: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
          business_option_id: 12345,
          business_uuid: 'd82bd863-26e5-4182-9a6b-f1dcc8507cb1',
          channel: 'channel_1',
          channel_set_uuid: 'c8cbcf36-032a-4ce7-a285-3df691c946f5',
          channel_uuid: undefined,
          created_at: new Date('2020-12-12'),
          currency: 'EUR',
          customer_email: 'narayan@payever.de',
          customer_name: 'Narayan Ghimire',
          delivery_fee: 2990000,
          down_payment: 30000000,
          fee_accepted: true,
          history: [],
          is_shipping_order_processed: true,
          items: [],
          merchant_email: 'merchant@payever.de',
          merchant_name: 'Merchant Doe',
          payment_details: {},
          payment_fee: 2000000,
          payment_flow_id: '67d3e998-8c6e-444f-9b5b-b2f38e8d532e',
          place: 'Bremen',
          reference: 'Reference 1',
          santander_applications: [],
          shipping_address: {},
          shipping_category: undefined,
          shipping_method_name: undefined,
          shipping_option_name: 'shipping_option_1',
          shipping_order_id: '8ca31b1f-87d0-4981-93e9-8c62d0de1e94',
          specific_status: 'ACCEPTED',
          status: 'PENDING',
          status_color: 'yellow',
          store_id: '1b42fd1c-3b28-47cf-b7fb-01c4281dc7f7',
          store_name: 'XYZ Store',
          total: 200000000,
          type: 'type_1',
          updated_at: new Date('2020-12-12'),
          user_uuid: '6c08ca77-abb6-4d07-ae83-24653ea94a14',
          example: false,
          example_shipping_label: 'example_shipping_label_1',
          example_shipping_slip: 'example_shipping_slip_1',
        },
      )
    });
    it('should return undefined when transactionModel does not exist', async () => {
      sandbox.stub(transactionModel, 'findOne').resolves(null);
      expect(
        await testService.findUnpackedByParams({}),
      ).to.eq(undefined);

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
      sandbox.stub(delayRemoveClient, 'deleteByQuery');

      await testService.removeByUuid(transaction._id);
      expect(delayRemoveClient.deleteByQuery).calledOnceWithExactly(
        ElasticTransactionEnum.index,
        ElasticTransactionEnum.type,
        {
          query: {
            match_phrase: {
              uuid: transaction._id,
            },
          },
        },
      );

    });

    it('should remove transaction model by uuid', async () => {
      sandbox.stub(transactionModel, 'findOneAndRemove').resolves(null);
      sandbox.stub(delayRemoveClient, 'deleteByQuery');

      await testService.removeByUuid(transaction._id);
      expect(delayRemoveClient.deleteByQuery).not.called;

    });
  });

  describe('pushHistoryRecord()', () => {
    it('should history record to transaction', async () => {
      sandbox.stub(transactionModel, 'findOneAndUpdate').resolves(transaction);
      sandbox.stub(elasticSearchClient, 'singleIndex');
      await testService.pushHistoryRecord(
        transaction,
        {
          action: 'delete',
        } as any,
      );
      expect(transactionModel.findOneAndUpdate).calledOnce;
      expect(elasticSearchClient.singleIndex).calledOnce;
    });
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
      expect(testService.findUnpackedByParams).calledOnce;

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
        uuid: 'c1020ecf-841e-4546-a7f9-a29a458b7cf0',
      } as any;

      sandbox.stub(transactionModel, 'findOneAndUpdate').resolves(transaction);
      sandbox.spy(elasticSearchClient, 'singleIndex');

      await testService.applyRpcResult(transactionUnpackedDetails, result);

      expect(transactionModel.findOneAndUpdate).calledWith(
        {
          uuid: transactionUnpackedDetails.uuid,
        },
        {
          $set: {
            amount: 123,
            delivery_fee: 123,
            status: 'in_process',
            specific_status: 'IN_PROGRESS',
            reference: 'reference',
            place: 'Hamburg',
            santander_applications: ['123', '456', '420'],
            payment_details: '{"application_no":"456","application_number":"420","finance_id":"123","pan_id":"420"}',
          },
        },
      );
      expect(elasticSearchClient.singleIndex).calledOnce;
    });

    it('should throw error when rpcResult.payment.amount is undefined', async () => {
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
    it('should apply action rpc result', async () => {
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
            _id: '6a617d41-ee72-5049-96ac-abae7077fa9c',
            name: 'cartname',
            uuid: '8c5a7165-ca31-4bf7-9a3f-ea6ce889f174',
            product_uuid: 'ba3097db-4d44-4fa8-873c-3c61c0537e12',
            created_at: new Date('2020-10-10'),
            description: 'description_1',
            fixed_shipping_price: 123,
            identifier: 'identifier_1',
            item_type: 'item_type_1',
            price: 123,
            price_net: 122,
            product_variant_uuid: '4f76b27c-6335-4865-be65-3c9c21b306d0',
            quantity: 12,
            shipping_price: 11,
            shipping_settings_rate: 53,
            shipping_settings_rate_type: 'TYPE_1',
            shipping_type: 'shipping_type_1',
            thumbnail: 'thumbnail.png',
            updated_at: new Date('2020-10-10'),
            url: 'wwww.payever.de/url',
            vat_rate: 13,
            weight: 100,
          },
        ],
        workflow_state: 'Hamburg',
      } as RpcResultDto;
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

      expect(transactionModel.findOneAndUpdate).calledWith(
        {
          uuid: transactionUnpackedDetails.uuid,
        },
        {
          $set: {
            items: [
              {
                _id: 'ba3097db-4d44-4fa8-873c-3c61c0537e12',
                uuid: 'ba3097db-4d44-4fa8-873c-3c61c0537e12',
                created_at: new Date('2020-10-10'),
                description: 'description_1',
                fixed_shipping_price: 123,
                identifier: 'identifier_1',
                item_type: 'item_type_1',
                name: 'cartname',
                options: undefined,
                price: 123,
                price_net: 122,
                product_variant_uuid: '4f76b27c-6335-4865-be65-3c9c21b306d0',
                quantity: 12,
                shipping_price: 11,
                shipping_settings_rate: 53,
                shipping_settings_rate_type: 'TYPE_1',
                shipping_type: 'shipping_type_1',
                thumbnail: 'thumbnail.png',
                updated_at: new Date('2020-10-10'),
                url: 'wwww.payever.de/url',
                vat_rate: 13,
                weight: 100,
              },
            ],
          },
        },
        {
          new: true,
        },
      );

    });
  });
});
