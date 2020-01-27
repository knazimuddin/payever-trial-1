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
    id: '0dcb9da7-3836-44cf-83b1-9e6c091d15dc',
    history: [
      {
        action: 'action 1',
        amount: 12,
        created_at: new Date('2020-10-10'),
        payment_status: 'PAYMENT_ACCAPTED',
        params: {},
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
    original_id: 'beab4573-e69c-45e2-afc0-5487b9e670ec',
    type: 'santander_installment_dk',
    uuid: '9e90b7d9-1920-4e5a-ba5f-f5aebb382e10',
    billing_address: {},
    created_at: new Date('2020-10-10'),
    updated_at: new Date('2020-10-10'),
    action_running: true,
    amount: 123,
    business_option_id: 12345,
    business_uuid: 'd04c6e67-a824-47ef-957b-d4f0d6038ea1',
    channel: 'channel-1',
    channel_set_uuid: '7c969d07-fadd-486d-891f-e64eb6a2ce0b',
    channel_uuid: 'a306a777-20a4-4760-b0b7-4e6055b5cbcc',
    currency: 'EUR',
    customer_name: 'Narayan Ghimire',
    delivery_fee: 1.99,
    down_payment: 100,
    fee_accepted: true,
    items: [
      {
        _id: '714d74ad-f30c-4377-880f-50e30834a9da',
      },
    ],
    merchant_email: 'merchant1@payever.de',
    merchant_name: 'Gabriel Gabriel',
    payment_details: {
      iban: 'DE89 3704 0044 0532 0130 00',
    },
    payment_fee: 1.23,
    payment_flow_id: 'b2e14754-a931-433c-a9a8-3fdb32dfbf3e',
    place: 'Bremen',
    reference: 'reference_1',
    santander_applications: ['Application 1'],
    shipping_address: {
      city: 'Hamburg',
    },
    shipping_category: 'Category 1',
  } as TransactionUnpackedDetailsInterface;


  const paymentFlow: PaymentFlowModel = {
    id: 'a9226ae8-e280-40f7-a1a1-5a8e10d464ef',
    toObject(): any {
      return this;
    },
  } as PaymentFlowModel;

  const bpoInstance: BusinessPaymentOptionModel = {
    id: 'e687a5e5-ab06-4b1c-ba07-78e43b649aa8',
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
      } as BusinessPaymentOptionModel;
      const trasnaction: TransactionBasicInterface = {
        business_option_id: 1234,
        id: uuid.v4(),
      } as TransactionBasicInterface;

      sandbox.stub(bpoService, 'findOneById').resolves(businessPaymentOptionModelInstance);

      const result: BusinessPaymentOptionModel = await testService.getBusinessPaymentOption(trasnaction);
      expect(result).to.equal(businessPaymentOptionModelInstance);
    });

  });

  describe('getPaymentFlow()', () => {
    it('should return the paymentFlowModel for given id', async () => {
      const paymentFlowModelInstance: PaymentFlowModel = {
        id: uuid.v4(),
      } as PaymentFlowModel;

      sandbox.stub(flowService, 'findOneById').resolves(paymentFlowModelInstance);

      expect(
        await testService.getPaymentFlow(
          paymentFlowModelInstance.id,
        ),
      ).to.eq(paymentFlowModelInstance);
    });
  });

  describe('getActionList()', () => {
    it('should return the list of actions when payment flow does not exists', async () => {
      const businessPaymentOptionModelInstance: BusinessPaymentOptionModel = {
        id: 1234,
        credentials: {
          key: 'value',
        },
      } as BusinessPaymentOptionModel;

      const message: MessageInterface = {
        name: 'message name',
        uuid: uuid.v4(),
      } as MessageInterface;

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
      expect(logger.error).calledWith({
        context: 'MessagingService',
        message: `Transaction 9e90b7d9-1920-4e5a-ba5f-f5aebb382e10 -> Payment flow cannot be null`,
        transaction: {
          id: 'beab4573-e69c-45e2-afc0-5487b9e670ec',
          uuid: '9e90b7d9-1920-4e5a-ba5f-f5aebb382e10',
          address: {},
          created_at: "2020-10-10T00:00:00+00:00",
          updated_at: "2020-10-10T00:00:00+00:00",
          action_running: true,
          amount: 123,
          business_option_id: 12345,
          business_uuid: 'd04c6e67-a824-47ef-957b-d4f0d6038ea1',
          channel: 'channel-1',
          channel_set_uuid: '7c969d07-fadd-486d-891f-e64eb6a2ce0b',
          channel_uuid: 'a306a777-20a4-4760-b0b7-4e6055b5cbcc',
          currency: 'EUR',
          customer_email: undefined,
          customer_name: 'Narayan Ghimire',
          delivery_fee: 1.99,
          down_payment: 100,
          fee_accepted: true,
          history: [
            {
              action: 'action 1',
              amount: 12,
              created_at: "2020-10-10T00:00:00+00:00",
              payment_status: 'PAYMENT_ACCAPTED',
              params: {},
              reason: 'reason 1',
              is_restock_items: true,
              upload_items: [{}],
              refund_items: [{}],
            },
          ],
          items: [{ _id: '714d74ad-f30c-4377-880f-50e30834a9da' }],
          merchant_email: 'merchant1@payever.de',
          merchant_name: 'Gabriel Gabriel',
          payment_details: { iban: 'DE89 3704 0044 0532 0130 00' },
          payment_fee: 1.23,
          payment_flow_id: 'b2e14754-a931-433c-a9a8-3fdb32dfbf3e',
          place: 'Bremen',
          reference: 'reference_1',
          santander_applications: ['Application 1'],
          shipping_address: { city: 'Hamburg' },
          shipping_category: 'Category 1',
          shipping_method_name: undefined,
          shipping_option_name: undefined,
          specific_status: undefined,
          status: undefined,
          status_color: undefined,
          store_id: undefined,
          store_name: undefined,
          total: undefined,
          type: 'santander_installment_dk',
          user_uuid: undefined,
        },
      })
    });

    it('should return empty array when \'unwrapRpcMessage\' return null ', async () => {
      const businessPaymentOptionModelInstance: BusinessPaymentOptionModel = {
        id: 1234,
        credentials: {
          key: 'value',
        },
      } as any;

      const message: MessageInterface = {
        name: 'message name',
        uuid: '9e3b4ea7-2aea-4a49-aae1-f163e16f98ca',
      } as any;

      const paymentFlow: PaymentFlowModel = {
        id: '15685d8a-b7b0-4dfb-84ec-bfa90f4ee247',
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

      const result: ActionItemInterface[] = await testService.getActionsList(transactionUnpackedDetails);
      expect(result).to.deep.equal([]);
    });

    it('should return an empty list of actions when business payment option does not exist ', async () => {
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
      sandbox.stub(logger, 'log');
      sandbox.stub(logger, 'error');
      sandbox.stub(paymentMicroService, 'getChannelByPaymentType').returns('channel_1');
      sandbox.stub(paymentMicroService, 'createPaymentMicroMessage').returns(message);

      const result: ActionItemInterface[] = await testService.getActionsList(transactionUnpackedDetails);
      expect(result).to.deep.equal([]);
      expect(logger.error).calledOnce;
    });

    it('should return  empty list of action when error occours while finding Payment Flow', async () => {
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

      const result: ActionItemInterface[] = await testService.getActionsList(transactionUnpackedDetails);
      expect(result).to.deep.equal([]);
      expect(logger.error).calledOnce;
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

      sandbox.stub(paymentMicroService, 'getChannelByPaymentType').returns('channel.name');
      sandbox.stub(paymentMicroService, 'createPaymentMicroMessage').returns({} as any);
      sandbox.stub(rabbitRpcClient, 'send').resolves({} as any);
      sandbox.stub(transactionService, 'findUnpackedByUuid')
      sandbox.stub(transactionService, 'applyActionRpcResult')
      sandbox.stub(messageBusService, 'unwrapRpcMessage').resolves(rpcResult);
      sandbox.stub(bpoService, 'findOneById').resolves(bpoInstance);
      sandbox.stub(flowService, 'findOneById').resolves(paymentFlow)
      await testService.runAction(transactionUnpackedDetails, 'capture', actionPayload);

      expect(rabbitRpcClient.send).calledOnceWithExactly({
        channel: 'channel.name',
      }, {})
      expect(transactionService.applyActionRpcResult).calledOnceWithExactly(
        {
          id: '0dcb9da7-3836-44cf-83b1-9e6c091d15dc',
          history: [
            {
              action: 'action 1',
              amount: 12,
              created_at: new Date('2020-10-10'),
              payment_status: 'PAYMENT_ACCAPTED',
              params: {},
              reason: 'reason 1',
              is_restock_items: true,
              upload_items: [{}],
              refund_items: [{}],
            },
          ],
          original_id: 'beab4573-e69c-45e2-afc0-5487b9e670ec',
          type: 'santander_installment_dk',
          uuid: '9e90b7d9-1920-4e5a-ba5f-f5aebb382e10',
          billing_address: {},
          created_at: new Date('2020-10-10'),
          updated_at: new Date('2020-10-10'),
          action_running: true,
          amount: 123,
          business_option_id: 12345,
          business_uuid: 'd04c6e67-a824-47ef-957b-d4f0d6038ea1',
          channel: 'channel-1',
          channel_set_uuid: '7c969d07-fadd-486d-891f-e64eb6a2ce0b',
          channel_uuid: 'a306a777-20a4-4760-b0b7-4e6055b5cbcc',
          currency: 'EUR',
          customer_name: 'Narayan Ghimire',
          delivery_fee: 1.99,
          down_payment: 100,
          fee_accepted: true,
          items: [{ _id: '714d74ad-f30c-4377-880f-50e30834a9da' }],
          merchant_email: 'merchant1@payever.de',
          merchant_name: 'Gabriel Gabriel',
          payment_details: { iban: 'DE89 3704 0044 0532 0130 00' },
          payment_fee: 1.23,
          payment_flow_id: 'b2e14754-a931-433c-a9a8-3fdb32dfbf3e',
          place: 'Bremen',
          reference: 'reference_1',
          santander_applications: ['Application 1'],
          shipping_address: { city: 'Hamburg' },
          shipping_category: 'Category 1',
        },
        { next_action: { next_action: { type: 'action' } } },
      )
      expect(transactionService.findUnpackedByUuid).calledOnceWithExactly('9e90b7d9-1920-4e5a-ba5f-f5aebb382e10');

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
      sandbox.stub(transactionService, 'applyActionRpcResult')
      await testService.runAction(transactionUnpackedDetails, 'refund', actionPayload);

      expect(transactionService.applyActionRpcResult).calledOnceWithExactly(
        {
          id: '0dcb9da7-3836-44cf-83b1-9e6c091d15dc',
          history: [
            {
              action: 'action 1',
              amount: 12,
              created_at: new Date('2020-10-10'),
              payment_status: 'PAYMENT_ACCAPTED',
              params: {},
              reason: 'reason 1',
              is_restock_items: true,
              upload_items: [{}],
              refund_items: [{}],
            },
          ],
          original_id: 'beab4573-e69c-45e2-afc0-5487b9e670ec',
          type: 'santander_installment_dk',
          uuid: '9e90b7d9-1920-4e5a-ba5f-f5aebb382e10',
          billing_address: {},
          created_at: new Date('2020-10-10'),
          updated_at: new Date('2020-10-10'),
          action_running: true,
          amount: 123,
          business_option_id: 12345,
          business_uuid: 'd04c6e67-a824-47ef-957b-d4f0d6038ea1',
          channel: 'channel-1',
          channel_set_uuid: '7c969d07-fadd-486d-891f-e64eb6a2ce0b',
          channel_uuid: 'a306a777-20a4-4760-b0b7-4e6055b5cbcc',
          currency: 'EUR',
          customer_name: 'Narayan Ghimire',
          delivery_fee: 1.99,
          down_payment: 100,
          fee_accepted: true,
          items: [{ _id: '714d74ad-f30c-4377-880f-50e30834a9da' }],
          merchant_email: 'merchant1@payever.de',
          merchant_name: 'Gabriel Gabriel',
          payment_details: { iban: 'DE89 3704 0044 0532 0130 00' },
          payment_fee: 1.23,
          payment_flow_id: 'b2e14754-a931-433c-a9a8-3fdb32dfbf3e',
          place: 'Bremen',
          reference: 'reference_1',
          santander_applications: ['Application 1'],
          shipping_address: { city: 'Hamburg' },
          shipping_category: 'Category 1',
        },
        {
          next_action: {
            next_action: { type: 'external_capture', payment_method: 'paypal', payload: {} }
          },
        },
      )
    });

    it('should run CHANGE_AMOUNT action', async () => {
      const actionPayload: ActionPayloadInterface = {
        fields: {
          capture_funds: {
            amount: '1.23',
          },
          payment_change_amount: {
            amount: 12,
          },
        },
        files: [
          {
            url: 'www.payever.de',
          },
        ],
      } as ActionPayloadInterface;

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
      sandbox.stub(transactionService, 'applyActionRpcResult');
      await testService.runAction(transactionUnpackedDetails, 'change_amount', actionPayload);

      expect(transactionService.applyActionRpcResult).calledOnceWithExactly(
        {
          id: '0dcb9da7-3836-44cf-83b1-9e6c091d15dc',
          history: [
            {
              action: 'action 1',
              amount: 12,
              created_at: new Date('2020-10-10'),
              payment_status: 'PAYMENT_ACCAPTED',
              params: {},
              reason: 'reason 1',
              is_restock_items: true,
              upload_items: [{}],
              refund_items: [{}],
            }
          ],
          original_id: 'beab4573-e69c-45e2-afc0-5487b9e670ec',
          type: 'santander_installment_dk',
          uuid: '9e90b7d9-1920-4e5a-ba5f-f5aebb382e10',
          billing_address: {},
          created_at: new Date('2020-10-10'),
          updated_at: new Date('2020-10-10'),
          action_running: true,
          amount: 123,
          business_option_id: 12345,
          business_uuid: 'd04c6e67-a824-47ef-957b-d4f0d6038ea1',
          channel: 'channel-1',
          channel_set_uuid: '7c969d07-fadd-486d-891f-e64eb6a2ce0b',
          channel_uuid: 'a306a777-20a4-4760-b0b7-4e6055b5cbcc',
          currency: 'EUR',
          customer_name: 'Narayan Ghimire',
          delivery_fee: 1.99,
          down_payment: 100,
          fee_accepted: true,
          items: [{ _id: '714d74ad-f30c-4377-880f-50e30834a9da' }],
          merchant_email: 'merchant1@payever.de',
          merchant_name: 'Gabriel Gabriel',
          payment_details: { iban: 'DE89 3704 0044 0532 0130 00' },
          payment_fee: 1.23,
          payment_flow_id: 'b2e14754-a931-433c-a9a8-3fdb32dfbf3e',
          place: 'Bremen',
          reference: 'reference_1',
          santander_applications: ['Application 1'],
          shipping_address: { city: 'Hamburg' },
          shipping_category: 'Category 1',
        },
        {
          next_action: {
            next_action: { type: 'external_capture', payment_method: 'paypal', payload: {} },
          },
        },
      )
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
      sandbox.stub(transactionService, 'applyActionRpcResult');
      await testService.runAction(transactionUnpackedDetails, 'edit', actionPayload);

      expect(transactionService.applyActionRpcResult).calledOnceWithExactly(
        {
          id: '0dcb9da7-3836-44cf-83b1-9e6c091d15dc',
          history: [
            {
              action: 'action 1',
              amount: 12,
              created_at: new Date('2020-10-10'),
              payment_status: 'PAYMENT_ACCAPTED',
              params: {},
              reason: 'reason 1',
              is_restock_items: true,
              upload_items: [{}],
              refund_items: [{}],
            }
          ],
          original_id: 'beab4573-e69c-45e2-afc0-5487b9e670ec',
          type: 'santander_installment_dk',
          uuid: '9e90b7d9-1920-4e5a-ba5f-f5aebb382e10',
          billing_address: {},
          created_at: new Date('2020-10-10'),
          updated_at: new Date('2020-10-10'),
          action_running: true,
          amount: 123,
          business_option_id: 12345,
          business_uuid: 'd04c6e67-a824-47ef-957b-d4f0d6038ea1',
          channel: 'channel-1',
          channel_set_uuid: '7c969d07-fadd-486d-891f-e64eb6a2ce0b',
          channel_uuid: 'a306a777-20a4-4760-b0b7-4e6055b5cbcc',
          currency: 'EUR',
          customer_name: 'Narayan Ghimire',
          delivery_fee: 1.99,
          down_payment: 100,
          fee_accepted: true,
          items: [{ _id: '714d74ad-f30c-4377-880f-50e30834a9da' }],
          merchant_email: 'merchant1@payever.de',
          merchant_name: 'Gabriel Gabriel',
          payment_details: { iban: 'DE89 3704 0044 0532 0130 00' },
          payment_fee: 1.23,
          payment_flow_id: 'b2e14754-a931-433c-a9a8-3fdb32dfbf3e',
          place: 'Bremen',
          reference: 'reference_1',
          santander_applications: ['Application 1'],
          shipping_address: { city: 'Hamburg' },
          shipping_category: 'Category 1'
        }, {
        next_action: {
          next_action: { type: 'external_capture', payment_method: 'paypal', payload: {} },
        },
      },
      )

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
      sandbox.stub(paymentMicroService, 'getChannelByPaymentType').returns('channel1')
      await testService.externalCapture('paypal', {});
      expect(rabbitRpcClient.send).calledOnceWithExactly(
        {
          channel: 'channel1',
        },
        undefined,
      )
    });
  });

  describe('sendTransactionUpdate()', () => {
    it('should send transaction update event', async () => {
      const message: MessageInterface = {
        name: 'name',
      } as MessageInterface;

      sandbox.stub(rabbitClient, 'send');
      sandbox.stub(messageBusService, 'createMessage').returns(message);
      await testService.sendTransactionUpdate(transactionUnpackedDetails);

      expect(rabbitClient.send).calledOnceWithExactly(
        { channel: 'transactions_app.payment.updated', exchange: 'async_events' },
        message,
      )
    });
  });
});
