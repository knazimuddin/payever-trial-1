import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';
import { TransactionHistoryEntryConverter } from '../../../../src/transactions/converter/transaction-history-entry.converter';
import { HistoryEventDataInterface, HistoryEventRefundItemInterface } from '../../../../src/transactions/interfaces/history-event-message';
import { TransactionModel } from '../../../../src/transactions/models';
import { CheckoutTransactionHistoryItemInterface } from '../../../../src/transactions/interfaces/checkout';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('TransactionHistoryEntryConverter', () => {
  const historyEventData: HistoryEventDataInterface = {
    amount: 12,
    payment_status: 'ACCEPTED',
    reason: 'reason_1',
    saved_data: [
      {
        type: 'type_1',
        name: 'name_1',
      },
    ],
    items_restocked: true,
    mail_event: {
      event_id: 'f01d7353-d56a-49af-b7cd-a1cead04fa44',
      template_name: 'template_name_1',
    },
    refund_items: [
      {
        count: 4,
        payment_item_id: '86b62cc1-cf75-4065-ac91-b1df6ccc6157',
      },
    ],
  }

  const transaction: TransactionModel = {
    items: [
      {
        id: '86b62cc1-cf75-4065-ac91-b1df6ccc6157',
        name: 'item_1',
      },
      {
        id: '86d6e5da-c5b2-41e6-b77f-0400cc17b9ab',
        name: 'item_2',
      },
    ],
  } as TransactionModel;

  describe('fromHistoryActionCompleteMessage()', () => {
    it('should complete message from history action', () => {
      const type: string = 'type_1';
      const createdAt: Date = new Date('2009-11-04T18:55:41+00:00');

      expect(TransactionHistoryEntryConverter.fromHistoryActionCompletedMessage(type, createdAt, historyEventData))
        .to.deep.equal(
          {
            action: type,
            amount: 12,
            created_at: createdAt,
            payment_status: 'ACCEPTED',
            reason: 'reason_1',
            upload_items: [
              {
                type: 'type_1',
                name: 'name_1',
              },
            ],
            is_restock_items: true,
            mail_event: {
              event_id: 'f01d7353-d56a-49af-b7cd-a1cead04fa44',
              template_name: 'template_name_1',
            },
          },
        )
    });

    it('should complete message from history action', () => {
      const type: string = 'type_1';
      const createdAt: Date = new Date('2009-11-04T18:55:41+00:00');
      const data: HistoryEventDataInterface = {
        amount: 12,
        payment_status: 'ACCEPTED',
        reason: 'reason_1',
        items_restocked: false,
      }
      expect(TransactionHistoryEntryConverter.fromHistoryActionCompletedMessage(type, createdAt, data))
        .to.deep.equal(
          {
            action: type,
            amount: 12,
            created_at: createdAt,
            payment_status: 'ACCEPTED',
            reason: 'reason_1',
          },
        )
    });
  });

  describe('fromHistoryRefundCompletedMessage()', () => {
    it('should complete message frm history refund', () => {
      const type: string = 'type_1';
      const createdAt: Date = new Date('2009-11-04T18:55:41+00:00');

      expect(TransactionHistoryEntryConverter.fromHistoryRefundCompletedMessage(
        transaction,
        type,
        createdAt,
        historyEventData,
      )).to.deep.equal(
        {
          action: type,
          amount: 12,
          created_at: createdAt,
          is_restock_items: true,
          payment_status: 'ACCEPTED',
          reason: 'reason_1',
          refund_items: [{
            count: 4,
            item_uuid: '86b62cc1-cf75-4065-ac91-b1df6ccc6157',
          }],
        },
      );
    });

    it('should complete message frm history refund', () => {
      const type: string = 'type_1';
      const createdAt: Date = new Date('2009-11-04T18:55:41+00:00');
      const data: HistoryEventDataInterface = {
        amount: 12,
        payment_status: 'ACCEPTED',
        reason: 'reason_1',
        items_restocked: false,
      }

      expect(TransactionHistoryEntryConverter.fromHistoryRefundCompletedMessage(
        transaction,
        type,
        createdAt,
        data,
      )).to.deep.equal(
        {
          action: type,
          amount: 12,
          created_at: createdAt,
          is_restock_items: false,
          payment_status: 'ACCEPTED',
          reason: 'reason_1',
          refund_items: [],
        },
      );
    });
  });

  describe('fromCheckoutTransactionHistoryItem()', () => {
    it('should return transactionHistoryentry from checkoutTransactionHistory', () => {
      const type: string = 'type_1';
      const createdAt: Date = new Date('2009-11-04T18:55:41+00:00');
      const data: CheckoutTransactionHistoryItemInterface = {
        action: 'action_1',
        amount: 123,
        created_at: new Date().toISOString(),
        payment_status: 'REFUNDED',
        reason: 'reason_1',
        items_restocked: true,
        params: [],
      }
      expect(TransactionHistoryEntryConverter.fromCheckoutTransactionHistoryItem(
        type,
        createdAt,
        data,
      )).to.deep.equal(
        {
          action: type,
          amount: 123,
          created_at: createdAt,
          payment_status: 'REFUNDED',
          reason: 'reason_1',
          is_restock_items: true,
          params: {},
        },
      )
    });

    it('should return transactionHistoryentry from checkoutTransactionHistory', () => {
      const type: string = 'type_1';
      const createdAt: Date = new Date('2009-11-04T18:55:41+00:00');
      const data: CheckoutTransactionHistoryItemInterface = {
        action: 'action_1',
        amount: 123,
        created_at: new Date().toISOString(),
        payment_status: 'REFUNDED',
        reason: 'reason_1',
        items_restocked: false,
        params: {
          value: 'val',
        },
      }
      expect(TransactionHistoryEntryConverter.fromCheckoutTransactionHistoryItem(
        type,
        createdAt,
        data,
      )).to.deep.equal(
        {
          action: type,
          amount: 123,
          created_at: createdAt,
          payment_status: 'REFUNDED',
          reason: 'reason_1',
          params: {
            value: 'val',
          },
        },
      )
    });
  });
});
