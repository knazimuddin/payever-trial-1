import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Logger } from '@nestjs/common';
import { TransactionActionService } from '../../../../src/transactions/services/transaction-action.service';
import { TransactionsService } from '../../../../src/transactions/services/transactions.service';
import { DtoValidationService } from '../../../../src/transactions/services/dto-validation.service';
import { MessagingService } from '../../../../src/transactions/services/messaging.service';
import { TransactionsExampleService } from '../../../../src/transactions/services/transactions-example.service';
import { ThirdPartyCallerService } from '../../../../src/transactions/services/third-party-caller.service';
import { ActionPayloadDto } from '../../../../src/transactions/dto/action-payload';
import { TransactionModel } from '../../../../src/transactions/models';
import * as uuid from 'uuid';
import { TransactionUnpackedDetailsInterface } from '../../../../src/transactions/interfaces';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('TransactonActionService()', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: TransactionActionService;
  let transactionsService: TransactionsService;
  let dtoValidation: DtoValidationService;
  let messagingService: MessagingService;
  let logger: Logger;
  let exampleService: TransactionsExampleService;
  let thirdPartyCallerService: ThirdPartyCallerService;

  const actionPayload: ActionPayloadDto = {
    fields: {
      payment_return: {},
    },
    files: [
      {
        url: 'www.payever.de/ files',
      },
      {
        url: 'www.payever.de/files',
      },
    ],
  } as ActionPayloadDto;

  const transaction: TransactionModel = {
    id: '4416ed60-93e4-4557-a4e8-5e57140ee88b',
    original_id: '627a3236-af6c-444a-836c-9f0d1d27c21a',
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
    created_at: new Date('2020-10-19'),
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

  const transactionInstant: TransactionModel = {
    id: '4416ed60-93e4-4557-a4e8-5e57140ee88b',
    original_id: '627a3236-af6c-444a-836c-9f0d1d27c21a',
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
    created_at: new Date('2020-10-19'),
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
    type: 'instant_payment',
    updated_at: new Date('2020-12-12'),
    user_uuid: '6c08ca77-abb6-4d07-ae83-24653ea94a14',
    example: false,
    example_shipping_label: 'example_shipping_label_1',
    example_shipping_slip: 'example_shipping_slip_1',
    toObject(): any { return this },
    save(): any { },
  } as TransactionModel;

  const transactionUnpacked: TransactionUnpackedDetailsInterface = {
    id: 'fad0e585-6baf-4d44-8aca-e36d628e7b79',
  } as TransactionUnpackedDetailsInterface;

  before(() => {
    transactionsService = {
      findUnpackedByUuid: (): any => { },
    } as any;

    dtoValidation = {
      checkFileUploadDto: (): any => { },
    } as any;

    messagingService = {
      runAction: (): any => { },
      sendTransactionUpdate: (): any => { },
    } as any;

    logger = {
      log: (): any => { },
    } as any;

    exampleService = {
      refundExample: (): any => { },
    } as any;

    testService = new TransactionActionService(
      transactionsService,
      dtoValidation,
      messagingService,
      thirdPartyCallerService,
      logger,
      exampleService,
    );
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('doAction()', () => {
    it('should perform action successfully', async () => {
      const unpackedTransaction: TransactionUnpackedDetailsInterface =
        {
          id: 'c1166506-05be-4626-b263-4d6549c24196',
        } as TransactionUnpackedDetailsInterface;



      sandbox.spy(messagingService, 'runAction');
      sandbox.stub(transactionsService, 'findUnpackedByUuid').resolves(unpackedTransaction);
      expect(
        await testService.doAction(transaction, actionPayload, 'action')
      ).to.deep.equal(unpackedTransaction);
    });

    it('should perform action successfully type instant_payment', async () => {
      const unpackedTransaction: TransactionUnpackedDetailsInterface =
        {
          id: 'c1166506-05be-4626-b263-4d6549c24196'
        } as TransactionUnpackedDetailsInterface;

      sandbox.spy(messagingService, 'runAction');
      sandbox.stub(transactionsService, 'findUnpackedByUuid').resolves(unpackedTransaction);

      const spy: sinon.SinonSpy = sandbox.spy(testService.doAction);
      try {
        await testService.doAction(transactionInstant, actionPayload, 'action');
      } catch (e) { }
      expect(spy.threw());
    });

    it('should throw error while performing action', async () => {
      sandbox.stub(messagingService, 'runAction').throws({
        message: 'Error Occured',
      })
      const spy: sinon.SinonSpy = sandbox.spy(testService.doAction);
      try {
        await testService.doAction(transaction, actionPayload, 'action');
      } catch (e) { }
      expect(spy.threw());
    });

    it('should throw error while performing action', async () => {
      sandbox.stub(messagingService, 'sendTransactionUpdate').throws(Error('new Error'))
      const spy: sinon.SinonSpy = sandbox.spy(testService.doAction);
      try {
        await testService.doAction(transaction, actionPayload, 'action');
      } catch (e) { }
      expect(spy.threw());
    });

  });

  describe('doFakeAction()', () => {
    it('should do fake actions for shipping_goods', async () => {
      const transactionModelInstance: TransactionModel = {
        uuid: '2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb',
        status: 'STATUS_UNPAID',
        place: 'place_1',
        shipping_order_id: '4630163e-69a4-4fb2-a8e0-3653e7a87902',
        billing_address: {
          id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        },
        save: (): any => { },
      } as TransactionModel;

      sandbox.stub(transactionsService, 'findUnpackedByUuid').resolves(transactionUnpacked);
      sandbox.spy(transactionModelInstance, 'save');

      expect(
        await testService.doFakeAction(transactionModelInstance, actionPayload, 'shipping_goods'),
      ).to.deep.equal(transactionUnpacked);

      expect(transactionModelInstance).to.deep.eq(
        {
          uuid: '2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb',
          status: 'STATUS_PAID',
          place: 'paid',
          shipping_order_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
          billing_address: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
          save: transactionModelInstance.save,
          example_shipping_label: '/api/business/undefined/2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb/label/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.pdf',
          example_shipping_slip: '/api/business/undefined/2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb/slip/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.json'
        },
      )
      expect(transactionModelInstance.save).calledOnce;
    });

    it('should do fake actions for shipping_goods', async () => {
      const transactionModelInstance: TransactionModel = {
        uuid: '2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb',
        status: 'STATUS_UNPAID',
        place: 'place_1',
        shipping_order_id: '4630163e-69a4-4fb2-a8e0-3653e7a87902',
        billing_address: {
          id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        },
        save: (): any => { },
      } as TransactionModel;

      sandbox.stub(transactionsService, 'findUnpackedByUuid').resolves(transactionUnpacked);
      sandbox.spy(transactionModelInstance, 'save');

      expect(
        await testService.doFakeAction(transactionModelInstance, actionPayload, 'shipping_goods'),
      ).to.deep.equal(transactionUnpacked);

      expect(transactionModelInstance).to.deep.eq(
        {
          uuid: '2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb',
          status: 'STATUS_PAID',
          place: 'paid',
          shipping_order_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
          billing_address: { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' },
          save: transactionModelInstance.save,
          example_shipping_label: '/api/business/undefined/2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb/label/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb.pdf',
          example_shipping_slip: '/api/business/undefined/2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb/slip/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb.json'
        },
      )
      expect(transactionModelInstance.save).calledOnce;
    });

    it('should do fake actions for shipping_goods', async () => {
      const transactionModelInstance: TransactionModel = {
        uuid: '2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb',
        status: 'STATUS_UNPAID',
        place: 'place_1',
        shipping_order_id: '4630163e-69a4-4fb2-a8e0-3653e7a87902',
        billing_address: {
          id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        },
        save: (): any => { },
      } as TransactionModel;

      sandbox.stub(transactionsService, 'findUnpackedByUuid').resolves(transactionUnpacked);
      sandbox.spy(transactionModelInstance, 'save');

      expect(
        await testService.doFakeAction(transactionModelInstance, actionPayload, 'shipping_goods'),
      ).to.deep.equal(transactionUnpacked);

      expect(transactionModelInstance).to.deep.eq(
        {
          uuid: '2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb',
          status: 'STATUS_PAID',
          place: 'paid',
          shipping_order_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
          billing_address: { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc' },
          save: transactionModelInstance.save,
          example_shipping_label: '/api/business/undefined/2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb/label/cccccccc-cccc-cccc-cccc-cccccccccccc.pdf',
          example_shipping_slip: '/api/business/undefined/2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb/slip/cccccccc-cccc-cccc-cccc-cccccccccccc.json'
        },
      )
      expect(transactionModelInstance.save).calledOnce;
    });

    it('should do fake actions for shipping_goods', async () => {
      const transactionModelInstance: TransactionModel = {
        uuid: '2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb',
        status: 'STATUS_UNPAID',
        place: 'place_1',
        shipping_order_id: '4630163e-69a4-4fb2-a8e0-3653e7a87902',
        billing_address: {
          id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        },
        save: (): any => { },
      } as TransactionModel;

      sandbox.stub(transactionsService, 'findUnpackedByUuid').resolves(transactionUnpacked);
      sandbox.spy(transactionModelInstance, 'save');

      expect(
        await testService.doFakeAction(transactionModelInstance, actionPayload, 'shipping_goods'),
      ).to.deep.equal(transactionUnpacked);

      expect(transactionModelInstance).to.deep.eq(
        {
          uuid: '2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb',
          status: 'STATUS_PAID',
          place: 'paid',
          shipping_order_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
          billing_address: { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd' },
          save: transactionModelInstance.save
        },
      )
      expect(transactionModelInstance.save).calledOnce;
    });

    it('should do fake actions for \'refund\'', async () => {
      const transactionModelInstance: TransactionModel = {
        uuid: '2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb',
        status: 'STATUS_UNPAID',
        place: 'place_1',
        save: (): any => { },
      } as TransactionModel;

      sandbox.stub(transactionsService, 'findUnpackedByUuid').resolves(transactionUnpacked);
      sandbox.spy(transactionModelInstance, 'save');

      expect(
        await testService.doFakeAction(transactionModelInstance, actionPayload, 'refund'),
      ).to.deep.equal(transactionUnpacked);

      expect(
        transactionModelInstance,
      ).to.deep.equal(
        {
          uuid: '2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb',
          status: 'STATUS_REFUNDED',
          place: 'refunded',
          save: transactionModelInstance.save,
        },
      );
      expect(transactionModelInstance.save).calledOnce;
    });

    it('should do fake actions for \'cancel\'', async () => {
      const transactionModelInstance: TransactionModel = {
        uuid: '2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb',
        status: 'STATUS_UNPAID',
        place: 'place_1',
        save: (): any => { },
      } as TransactionModel;

      sandbox.stub(transactionsService, 'findUnpackedByUuid').resolves(transactionUnpacked);
      sandbox.spy(transactionModelInstance, 'save');

      expect(
        await testService.doFakeAction(transactionModelInstance, actionPayload, 'cancel'),
      ).to.deep.equal(transactionUnpacked);

      expect(
        transactionModelInstance,
      ).to.deep.equal(
        {
          uuid: '2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb',
          status: 'STATUS_CANCELLED',
          place: 'cancelled',
          save: transactionModelInstance.save,
        },
      );
      expect(transactionModelInstance.save).calledOnce;
    });

    it('should do fake actions for \'test\'', async () => {
      const transactionModelInstance: TransactionModel = {
        uuid: '2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb',
        status: 'STATUS_UNPAID',
        place: 'place_1',
        save: (): any => { },
      } as TransactionModel;

      sandbox.stub(transactionsService, 'findUnpackedByUuid').resolves(transactionUnpacked);
      sandbox.spy(transactionModelInstance, 'save');

      expect(
        await testService.doFakeAction(transactionModelInstance, actionPayload, 'test'),
      ).to.deep.equal(transactionUnpacked);

      expect(
        transactionModelInstance,
      ).to.deep.equal(
        {
          uuid: '2a9eb2e2-33b3-4bc9-9634-7f25eea59cfb',
          status: 'STATUS_UNPAID',
          place: 'place_1',
          save: transactionModelInstance.save,
        },
      );
      expect(transactionModelInstance.save).calledOnce;
    });

  });
});
