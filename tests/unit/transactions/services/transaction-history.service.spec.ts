import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Logger } from '@nestjs/common';
import { TransactionHistoryService } from '../../../../src/transactions/services/transaction-history.service';
import { TransactionsService } from '../../../../src/transactions/services/transactions.service';
import { TransactionModel } from '../../../../src/transactions/models';
import { HistoryEventDataInterface } from '../../../../src/transactions/interfaces/history-event-message';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('TransactionHistoryService', async () => {
  let sandbox: sinon.SinonSandbox;
  let testService: TransactionHistoryService;
  let transactionsService: TransactionsService;
  let logger: Logger;

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

  before(() => {
    transactionsService = {
      pushHistoryRecord: (): any => { },
    } as any;

    logger = {
      log: (): any => { },
    } as any;

    testService = new TransactionHistoryService(transactionsService, logger);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('processHistoryRecord()', () => {
    it('should process history record for \'return\' type', async () => {
      const createdAt: Date = new Date('2020-10-10')
      const historyEventData: HistoryEventDataInterface = {
        amount: 123,
        payment_status: 'paid',
        reason: 'reason 1',
      } as HistoryEventDataInterface;

      sandbox.spy(transactionsService, 'pushHistoryRecord');

      await testService.processHistoryRecord(transaction, 'return', createdAt, historyEventData);
      expect(transactionsService.pushHistoryRecord).calledWith(transaction,
        {
          action: 'return',
          amount: 123,
          created_at: createdAt,
          is_restock_items: false,
          payment_status: 'paid',
          reason: 'reason 1',
          refund_items: [],
        },
      );
    });

    it('should process history record for \'unknown\' type', async () => {
      const createdAt: Date = new Date('2020-10-10')
      const historyEventData: HistoryEventDataInterface = {
        amount: 123,
        payment_status: 'paid',
        reason: 'reason 1',
      } as HistoryEventDataInterface;

      sandbox.spy(transactionsService, 'pushHistoryRecord');

      await testService.processHistoryRecord(transaction, 'uknown', createdAt, historyEventData);

      expect(transactionsService.pushHistoryRecord).calledWith(transaction,
        {
          action: 'uknown',
          amount: 123,
          created_at: createdAt,
          payment_status: 'paid',
          reason: 'reason 1',
        });
    });
  });
});
