import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Logger } from '@nestjs/common';
import * as uuid from 'uuid';
import { MessageBusService, RabbitMqClient, RabbitMqRPCClient, MessageInterface } from '@pe/nest-kit';

import { MessagingService } from '../../../../src/transactions/services/messaging.service';
import { TransactionsService } from '../../../../src/transactions/services/transactions.service';
import { BusinessPaymentOptionService } from '../../../../src/transactions/services/business-payment-option.service';
import { PaymentFlowService } from '../../../../src/transactions/services/payment-flow.service';
import { PaymentsMicroService } from '../../../../src/transactions/services/payments-micro.service';
import {
  TransactionBasicInterface,
  TransactionUnpackedDetailsInterface,
  ActionItemInterface,
} from '../../../../src/transactions/interfaces';
import { BusinessPaymentOptionModel, PaymentFlowModel } from '../../../../src/transactions/models';
import { ActionPayloadInterface } from '../../../../src/transactions/interfaces/action-payload';
import { ConfigService } from '@nestjs/config';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('MessagingService', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: MessagingService;
  let transactionService: TransactionsService;
  let bpoService: BusinessPaymentOptionService;
  let flowService: PaymentFlowService;
  let paymentMicroService: PaymentsMicroService;
  let rabbitRpcClient: RabbitMqRPCClient;
  let rabbitClient: RabbitMqClient;
  let logger: Logger;
  let messageBusService: MessageBusService;
  let configService: ConfigService;

  const transactionUnpackedDetails: TransactionUnpackedDetailsInterface = {
    id: uuid.v4(),
    history: [
      {
        action: 'action 1',
        amount: 12,
        created_at: new Date(),
        payment_status: 'PAYMENT_ACCAPTED',
        params: {
          key: 'value',
        },
        reason: 'reason 1',
        is_restock_items: true,
        upload_items: [
          {},
        ],
        refund_items: [
          {},
        ],
      },
    ],
    original_id: uuid.v4(),
    type: 'santander_installment_dk',
    uuid: uuid.v4(),
    billing_address: {},
    created_at: new Date(),
    updated_at: new Date(),
    action_running: true,
    amount: 123,
    business_option_id: 12345,
    business_uuid: uuid.v4(),
    channel: 'channel-1',
    channel_set_uuid: uuid.v4(),
    channel_uuid: uuid.v4(),
    currency: 'EUR',
    customer_name: 'Narayan Ghimire',
    delivery_fee: 1.99,
    down_payment: 100,
    fee_accapted: true,
    items: [
      {
        _id: uuid.v4(),
      } as any,
    ],
    merchant_email: 'merchant1@payever.de',
    merchant_ame: 'Gabriel Gabriel',
    payment_details: {
      iban: 'DE89 3704 0044 0532 0130 00',
    },
    payment_fee: 1.23,
    payment_flow_id: uuid.v4(),
    place: 'Bremen',
    reference: 'reference_1',
    santander_applications: 'Application 1',
    shipping_address: {
      city: 'Hamburg',
    },
    shipping_category: 'Category 1',
  } as any;


  const paymentFlow: PaymentFlowModel = {
    id: uuid.v4(),
    toObject(): any {
      return this;
    },
  } as any;

  const bpoInstance: BusinessPaymentOptionModel = {
    id: uuid.v4(),
  } as any;

  before(() => {
    transactionService = {
      applyActionRpcResult: (): any => { },
      applyRpcResult: (): any => { },
      findUnpackedByUuid: (): any => { },
    } as any;

    bpoService = {
      findOneById: (): any => { },
    } as any;

    flowService = {
      findOneById: (): any => { },
    } as any;

    paymentMicroService = {
      createPaymentMicroMessage: (): any => { },
      getChannelByPaymentType: (): any => { },
    } as any;

    rabbitRpcClient = {
      send: (): any => { },
    } as any;

    rabbitClient = {
      send: (): any => { },
    } as any;

    logger = {
      error: (): any => { },
      log: (): any => { },
    } as any;

    messageBusService = {
      createMessage: (): any => { },
      unwrapRpcMessage: (): any => { },
    } as any;

    configService = {
      get: (): any => true,
    } as any

    testService = new MessagingService(
      transactionService,
      bpoService,
      flowService,
      paymentMicroService,
      rabbitRpcClient,
      rabbitClient,
      logger,
      messageBusService,
      configService,
    );
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('getBusinessPaymentOption()', () => {

    it('should return businesspaymetOption for the transaction', async () => {
      const businessPaymentOptionModelInstance: BusinessPaymentOptionModel = {
        id: 1234,
      } as any;
      const trasnaction: TransactionBasicInterface = {
        business_option_id: 1234,
        id: uuid.v4(),
      } as any;
      sandbox.stub(bpoService, 'findOneById').resolves(businessPaymentOptionModelInstance);
      const result: BusinessPaymentOptionModel = await testService.getBusinessPaymentOption(trasnaction);
      expect(result).to.equal(businessPaymentOptionModelInstance);
    });

  });

  describe('getPaymentFlow()', () => {
    it('should return the paymentFlowModel for given id', async () => {
      const paymentFlowModelInstance: PaymentFlowModel = {
        id: uuid.v4(),
      } as any;

      sandbox.stub(flowService, 'findOneById').resolves(paymentFlowModelInstance);

      expect(
        await testService.getPaymentFlow(
          paymentFlowModelInstance.id,
        ),
      ).to.eq(paymentFlowModelInstance);
    });
  });

  describe('getActionList()', () => {
    it('should return the list of actions', async () => {
      const businessPaymentOptionModelInstance: BusinessPaymentOptionModel = {
        id: 1234,
        credentials: {
          key: 'value',
        },
      } as any;

      const message: MessageInterface = {
        name: 'message name',
        uuid: uuid.v4(),
      } as any;

      const actionsResponse: { [key: string]: boolean } = {
        create: true,
        edit: false,
      }
      const actionItems: ActionItemInterface[] = [
        {
          action: 'create',
          enabled: true,
        },
      ]

      sandbox.stub(bpoService, 'findOneById').resolves(businessPaymentOptionModelInstance);
      sandbox.stub(flowService, 'findOneById').resolves(null);
      sandbox.stub(logger, 'log');
      sandbox.stub(logger, 'error');
      sandbox.stub(paymentMicroService, 'getChannelByPaymentType').returns('channel_1');
      sandbox.stub(paymentMicroService, 'createPaymentMicroMessage').returns(message);
      sandbox.stub(messageBusService, 'unwrapRpcMessage').returns(actionsResponse);

      const result: ActionItemInterface[] = await testService.getActionsList(transactionUnpackedDetails);
      expect(result).to.deep.equal(actionItems);
    });

    it('should return the list of actions ', async () => {
      const transaction: TransactionUnpackedDetailsInterface = {
        id: uuid.v4(),
        history: [
          {
            action: 'action 1',
            amount: 12,
            created_at: new Date(),
            payment_status: 'PAYMENT_ACCAPTED',
          },
        ],
        original_id: uuid.v4(),
        type: 'santander_installment_dk',
        uuid: uuid.v4(),
        billing_address: {},
        created_at: new Date(),
        updated_at: new Date(),

        items: [
          {
            _id: uuid.v4(),
          } as any,
        ],

        payment_details: {
          iban: 'DE89 3704 0044 0532 0130 00',
        },
        payment_fee: 1.23,
        payment_flow_id: uuid.v4(),
        place: 'Bremen',
        reference: 'reference_1',
        santander_applications: 'Application 1',
        shipping_address: {
          city: 'Hamburg',
        },
        shipping_category: 'Category 1',
      } as any;

      const businessPaymentOptionModelInstance: BusinessPaymentOptionModel = {
        id: 1234,
        credentials: {
          key: 'value',
        },
      } as any;

      const message: MessageInterface = {
        name: 'message name',
        uuid: uuid.v4(),
      } as any;

      const paymentFlow: PaymentFlowModel = {
        id: uuid.v4(),
        toObject(): any {
          return this;
        },
      } as any;

      sandbox.stub(bpoService, 'findOneById').resolves(businessPaymentOptionModelInstance);
      sandbox.stub(flowService, 'findOneById').resolves(paymentFlow);
      sandbox.stub(logger, 'log');
      sandbox.stub(logger, 'error');
      sandbox.stub(paymentMicroService, 'getChannelByPaymentType').returns('channel_1');
      sandbox.stub(paymentMicroService, 'createPaymentMicroMessage').returns(message);
      sandbox.stub(messageBusService, 'unwrapRpcMessage').returns(null);

      const result: ActionItemInterface[] = await testService.getActionsList(transaction);
      expect(result).to.deep.equal([]);
    });

    it('should return the list of actions throws error', async () => {
      const transaction: TransactionUnpackedDetailsInterface = {
        id: uuid.v4(),
        history: [
          {
            action: 'action 1',
            amount: 12,
            created_at: new Date(),
            payment_status: 'PAYMENT_ACCAPTED',
          },
        ],
        original_id: uuid.v4(),
        type: 'santander_installment_dk',
        uuid: uuid.v4(),
        billing_address: {},
        created_at: new Date(),
        updated_at: new Date(),
        items: [
          {
            _id: uuid.v4(),
          } as any,
        ],
        merchant_email: 'merchant1@payever.de',
        merchant_ame: 'Gabriel Gabriel',
        payment_details: {
          iban: 'DE89 3704 0044 0532 0130 00',
        },
        payment_fee: 1.23,
        payment_flow_id: uuid.v4(),
        place: 'Bremen',
        reference: 'reference_1',
        santander_applications: 'Application 1',
        shipping_address: {
          city: 'Hamburg',
        },
        shipping_category: 'Category 1',
      } as any;

      const message: MessageInterface = {
        name: 'message name',
        uuid: uuid.v4(),
      } as any;

      const paymentFlow: PaymentFlowModel = {
        id: uuid.v4(),
        toObject(): any {
          return this;
        },
      } as any;

      sandbox.stub(bpoService, 'findOneById').resolves(null);
      sandbox.stub(flowService, 'findOneById').resolves(paymentFlow);
      sandbox
      sandbox.stub(logger, 'log');
      sandbox.stub(logger, 'error');
      sandbox.stub(paymentMicroService, 'getChannelByPaymentType').returns('channel_1');
      sandbox.stub(paymentMicroService, 'createPaymentMicroMessage').returns(message);
      sandbox.stub(messageBusService, 'unwrapRpcMessage').returns(null);

      const result: ActionItemInterface[] = await testService.getActionsList(transaction);
      expect(result).to.deep.equal([]);
    });
    it('should return the list of actions throws error', async () => {
      const transaction: TransactionUnpackedDetailsInterface = {
        id: uuid.v4(),
        history: [
          {
            action: 'action 1',
            amount: 12,
            created_at: new Date(),
            payment_status: 'PAYMENT_ACCAPTED',
          },
        ],
        original_id: uuid.v4(),
        type: 'santander_installment_dk',
        uuid: uuid.v4(),
        billing_address: {},
        created_at: new Date(),
        updated_at: new Date(),
        items: [
          {
            _id: uuid.v4(),
          } as any,
        ],
        merchant_email: 'merchant1@payever.de',
        merchant_ame: 'Gabriel Gabriel',
        payment_details: {
          iban: 'DE89 3704 0044 0532 0130 00',
        },
        payment_fee: 1.23,
        payment_flow_id: uuid.v4(),
        place: 'Bremen',
        reference: 'reference_1',
        santander_applications: 'Application 1',
        shipping_address: {
          city: 'Hamburg',
        },
        shipping_category: 'Category 1',
      } as any;

      const message: MessageInterface = {
        name: 'message name',
        uuid: uuid.v4(),
      } as any;

      sandbox.stub(bpoService, 'findOneById').resolves(null);
      sandbox.stub(flowService, 'findOneById').throws(
        {
          message: 'Error Occured!',
        },
      );
      sandbox.stub(logger, 'log');
      sandbox.stub(logger, 'error');
      sandbox.stub(paymentMicroService, 'getChannelByPaymentType').returns('channel_1');
      sandbox.stub(paymentMicroService, 'createPaymentMicroMessage').returns(message);
      sandbox.stub(messageBusService, 'unwrapRpcMessage').returns(null);

      const result: ActionItemInterface[] = await testService.getActionsList(transaction);
      expect(result).to.deep.equal([]);
    });
  });

  describe('runAction()', () => {
    it('should run CAPTURE action', async () => {
      const actionPayload: ActionPayloadInterface = {
        fields: {
          capture_funds: {
            amount: '1.23',
          },
        },
        files: [
          {
            url: 'www.payever.de',
          },
        ],
      } as any;

      const rpcResult: any = {
        next_action: {
          next_action: {
            type: 'action',
          },
        },
      }

      sandbox.stub(paymentMicroService, 'getChannelByPaymentType').resolves('Channel 1');
      sandbox.stub(paymentMicroService, 'createPaymentMicroMessage').resolves({} as any);
      sandbox.stub(rabbitRpcClient, 'send').resolves({} as any);
      sandbox.stub(transactionService, 'findUnpackedByUuid')
      sandbox.stub(messageBusService, 'unwrapRpcMessage').resolves(rpcResult);
      sandbox.stub(bpoService, 'findOneById').resolves(bpoInstance);
      sandbox.stub(flowService, 'findOneById').resolves(paymentFlow)
      await testService.runAction(transactionUnpackedDetails, 'capture', actionPayload);

    });

    it('should run REFUND action', async () => {
      const actionPayload: ActionPayloadInterface = {
        fields: {
          capture_funds: {
            amount: '1.23',
          },
          payment_return: {},

        },
        files: [
          {
            url: 'www.payever.de',
          },
        ],
      } as any;

      const rpcResult: any = {
        next_action: {
          next_action: {
            type: 'external_capture',
            payment_method: 'paypal',
            payload: {},
          },
        },
      }

      sandbox.stub(paymentMicroService, 'getChannelByPaymentType').resolves('Channel 1');
      sandbox.stub(paymentMicroService, 'createPaymentMicroMessage').resolves({} as any);
      sandbox.stub(rabbitRpcClient, 'send').resolves({} as any);
      sandbox.stub(transactionService, 'findUnpackedByUuid')
      sandbox.stub(messageBusService, 'unwrapRpcMessage').resolves(rpcResult);
      sandbox.stub(bpoService, 'findOneById').resolves(bpoInstance);
      sandbox.stub(testService, 'externalCapture');
      sandbox.stub(flowService, 'findOneById').resolves(paymentFlow)
      await testService.runAction(transactionUnpackedDetails, 'refund', actionPayload);
    });

    it('should run CHANGE_AMOUNT action', async () => {
      const actionPayload: ActionPayloadInterface = {
        fields: {
          capture_funds: {
            amount: '1.23',
          },
          payment_change_amount: {},
        },
        files: [
          {
            url: 'www.payever.de',
          },
        ],
      } as any;

      const rpcResult: any = {
        next_action: {
          next_action: {
            type: 'external_capture',
            payment_method: 'paypal',
            payload: {},
          },
        },
      }

      sandbox.stub(paymentMicroService, 'getChannelByPaymentType').resolves('Channel 1');
      sandbox.stub(paymentMicroService, 'createPaymentMicroMessage').resolves({} as any);
      sandbox.stub(rabbitRpcClient, 'send').resolves({} as any);
      sandbox.stub(transactionService, 'findUnpackedByUuid')
      sandbox.stub(messageBusService, 'unwrapRpcMessage').resolves(rpcResult);
      sandbox.stub(bpoService, 'findOneById').resolves(bpoInstance);
      sandbox.stub(testService, 'externalCapture');
      sandbox.stub(flowService, 'findOneById').resolves(paymentFlow)
      await testService.runAction(transactionUnpackedDetails, 'change_amount', actionPayload);

    });

    it('should run EDIT action', async () => {
      const actionPayload: ActionPayloadInterface = {
        fields: {
          capture_funds: {
            amount: '1.23',
          },
          payment_update: {
            updatedData: {
              deliveryFee: '123',
              productLine: [],
            },
            reason: 'some reason',
          },
        },
        files: [
          {
            url: 'www.payever.de',
          },
        ],
      } as any;

      const rpcResult: any = {
        next_action: {
          next_action: {
            type: 'external_capture',
            payment_method: 'paypal',
            payload: {},
          },
        },
      }

      sandbox.stub(paymentMicroService, 'getChannelByPaymentType').resolves('Channel 1');
      sandbox.stub(paymentMicroService, 'createPaymentMicroMessage').resolves({} as any);
      sandbox.stub(rabbitRpcClient, 'send').resolves({} as any);
      sandbox.stub(transactionService, 'findUnpackedByUuid')
      sandbox.stub(messageBusService, 'unwrapRpcMessage').resolves(rpcResult);
      sandbox.stub(bpoService, 'findOneById').resolves(bpoInstance);
      sandbox.stub(testService, 'externalCapture');
      sandbox.stub(flowService, 'findOneById').resolves(paymentFlow);
      await testService.runAction(transactionUnpackedDetails, 'edit', actionPayload);

    });

    it('should throw error', async () => {
      const actionPayload: ActionPayloadInterface = {
        fields: {
          capture_funds: {
            amount: '1.23',
          },
          payment_update: {
            updatedData: {
              deliveryFee: '123',
              productLine: [],
            },
            reason: 'some reason',
          },
        },
        files: [
          {
            url: 'www.payever.de',
          },
        ],
      } as any;

      const rpcResult: any = {
        next_action: {
          next_action: {
            type: 'external_capture',
            payment_method: 'paypal',
            payload: {},
          },
        },
      }

      sandbox.stub(paymentMicroService, 'getChannelByPaymentType').resolves('Channel 1');
      sandbox.stub(paymentMicroService, 'createPaymentMicroMessage').resolves({} as any);
      sandbox.stub(rabbitRpcClient, 'send').resolves({} as any);
      sandbox.stub(transactionService, 'findUnpackedByUuid')
      sandbox.stub(messageBusService, 'unwrapRpcMessage').resolves(rpcResult);
      sandbox.stub(bpoService, 'findOneById').throws({});
      sandbox.stub(testService, 'externalCapture');
      sandbox.stub(flowService, 'findOneById').resolves(null);
      expect(
        () => testService.runAction(transactionUnpackedDetails, 'edit', actionPayload),
      ).to.throw;
    });
  });

  describe('updateStatus()', () => {
    it('should update status', async () => {
      sandbox.stub(testService, 'getBusinessPaymentOption').resolves(bpoInstance);
      sandbox.stub(testService, 'getPaymentFlow').resolves(paymentFlow);
      sandbox.stub(transactionService, 'applyRpcResult').resolves(null);
      await testService.updateStatus(transactionUnpackedDetails);
    });

    it('should should throw error', async () => {
      sandbox.stub(testService, 'getBusinessPaymentOption').throws({});
      sandbox.stub(testService, 'getPaymentFlow').resolves(paymentFlow);
      sandbox.stub(transactionService, 'applyRpcResult').resolves(null);
      expect(
        () => testService.updateStatus(transactionUnpackedDetails),
      ).to.throw;
    });

  });

  describe('externalCapture()', () => {
    it('should send rabbit event', async () => {
      sandbox.stub(rabbitRpcClient, 'send');
      sandbox.stub(paymentMicroService, 'createPaymentMicroMessage')
      await testService.externalCapture('paypal', {});
    });
  });

  describe('sendTransactionUpdate()', () => {
    it('should send transaction update event', async () => {
      sandbox.stub(rabbitClient, 'send');
      sandbox.stub(messageBusService, 'createMessage');
      await testService.sendTransactionUpdate(transactionUnpackedDetails);
    });
  });
});
