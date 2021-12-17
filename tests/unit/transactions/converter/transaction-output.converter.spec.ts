import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { TransactionUnpackedDetailsInterface, ActionItemInterface } from '../../../../src/transactions/interfaces';
import { TransactionOutputConverter } from '../../../../src/transactions/converter/transaction-output.converter';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('TransactionOutputConverter', () => {
  describe('convert()', () => {
    it('should convert transaction to transactionOutPutInterface', () => {
      const transaction: TransactionUnpackedDetailsInterface = {
        id: '18600e2d-8bd0-4d07-a8e6-ddec50a1cb9e',
        original_id: '6bceacfc-178e-4cc5-a91f-2104cf04c1a0',
        uuid: 'b4fd1c4d-d2b6-4484-be63-8f5d027d4585',
        action_running: true,
        amount: 123,
        amount_capture_rest: 100,
        amount_captured: 23,
        amount_refunded: 456,
        amount_refund_rest: 789,
        available_refund_items: [
          {
            count: 123,
            item_uuid: '612ee040-821e-47db-b7f7-487e617e89fc',
          },
        ],
        billing_address: {
          city: 'Hamburg',
          company: 'Payever',
          country: 'DE',
          country_name: 'Germany',
          email: 'billing@payever.de',
          fax: '123456789',
          first_name: 'Narayan',
          last_name: 'Ghimire',
          mobile_phone: '015912345678',
          phone: '1238344884',
          salutation: 'Prof',
          social_security_number: '1234567890',
          street: 'rodings markts',
          type: 'billing',
          zip_code: '12344',
        },
        business_option_id: 12,
        business_uuid: 'fd45dae7-27c1-46c4-9309-d4d0fbd67a8d',
        channel: 'channel_1', // 'store', ...
        channel_uuid: '0b66ec21-1de8-4f63-8776-8cdc0ceba73e',
        channel_set_uuid: 'a20927f2-738b-4a65-8e13-59453fbd06c9',
        created_at: new Date('2009-11-04T18:55:41.000Z'),
        currency: 'EUR',
        customer_email: 'customer@payever.de',
        customer_name: 'Dario',
        delivery_fee: 345,
        down_payment: 678,
        fee_accepted: true,
        history: [],
        items: [],
        merchant_email: 'merchant@email.de',
        merchant_name: 'Merchant Mann',
        payment_fee: 123,
        payment_flow_id: '921fb499-6250-4773-9615-1e2d179af30a',
        payment_details: {},
        place: 'Hamburg',
        reference: 'reference',
        shipping_address: {},
        shipping_category: 'category_1',
        shipping_method_name: 'dhl',
        shipping_option_name: 'dhl-option',
        shipping_order_id: '75fa57b4-ef38-46ae-8abc-88e6cab1e23b',
        is_shipping_order_processed: true,
        specific_status: 'STATUS',
        status: 'ACCEPTED',
        status_color: 'GREEN',
        store_id: '4deedcf7-255c-466f-ae25-9073b349dcc7',
        store_name: 'wallmart',
        total: 901,
        total_left: 456,
        type: 'type_1',
        updated_at: new Date('2019-11-04T18:55:41.000Z'),
        user_uuid: '4e75b65b-3f89-4c11-9fc8-a8b2a34fa86d',

        example: true,
        example_shipping_label: 'example_label_1',
        example_shipping_slip: 'example_slip_1',
      } as TransactionUnpackedDetailsInterface;

      const actions: ActionItemInterface[] = [
        {
          action: 'action_1',
          enabled: true,
          partialAllowed: false,
        },
      ]
      expect(TransactionOutputConverter.convert(transaction, actions))
        .to.deep.eq({
          actions: [
            {
              action: 'action_1',
              enabled: true,
              partialAllowed: false,
            },
          ],
          transaction: {
            id: '18600e2d-8bd0-4d07-a8e6-ddec50a1cb9e',
            original_id: '6bceacfc-178e-4cc5-a91f-2104cf04c1a0',
            uuid: 'b4fd1c4d-d2b6-4484-be63-8f5d027d4585',
            amount: 123,
            amount_capture_rest: 100,
            amount_captured: 23,
            amount_refunded: 456,
            amount_refund_rest: 789,
            currency: 'EUR',
            total: 901,
            total_left: 456,
            created_at: new Date('2009-11-04T18:55:41.000Z'),
            updated_at: new Date('2019-11-04T18:55:41.000Z'),
            example: true,

          },
          billing_address: {
            city: 'Hamburg',
            company: 'Payever',
            country: 'DE',
            country_name: 'Germany',
            email: 'billing@payever.de',
            fax: '123456789',
            first_name: 'Narayan',
            last_name: 'Ghimire',
            mobile_phone: '015912345678',
            phone: '1238344884',
            salutation: 'Prof',
            social_security_number: '1234567890',
            street: 'rodings markts',
            type: 'billing',
            zip_code: '12344',
          },
          business: {
            uuid: 'fd45dae7-27c1-46c4-9309-d4d0fbd67a8d',
          },
          cart: {
            available_refund_items: [
              {
                count: 123,
                item_uuid: '612ee040-821e-47db-b7f7-487e617e89fc',
              },
            ],
            items: [],
          },
          channel: {
            name: 'channel_1',
            uuid: '0b66ec21-1de8-4f63-8776-8cdc0ceba73e',
          },
          channel_set: {
            uuid: 'a20927f2-738b-4a65-8e13-59453fbd06c9',
          },
          customer: {
            email: 'customer@payever.de',
            name: 'Dario',
          },
          details: {
            order: {
              application_no: undefined,
              finance_id: undefined,
              iban: undefined,
              pan_id: undefined,
              reference: 'reference',
            },
          },
          history: [],
          merchant: {
            email: 'merchant@email.de',
            name: 'Merchant Mann',
          },
          payment_flow: {
            id: '921fb499-6250-4773-9615-1e2d179af30a',
          },
          payment_option: {
            down_payment: 678,
            fee_accepted: true,
            id: 12,
            payment_fee: 123,
            type: 'type_1',
          },
          shipping: {

            address: {},
            category: 'category_1',
            delivery_fee: 345,
            method_name: 'dhl',
            option_name: 'dhl-option',
            example_label: 'example_label_1',
            example_slip: 'example_slip_1',
            order_id: '75fa57b4-ef38-46ae-8abc-88e6cab1e23b',
          },
          status: {
            color: 'GREEN',
            general: 'ACCEPTED',
            place: 'Hamburg',
            specific: 'STATUS',
          },
          store: {
            id: '4deedcf7-255c-466f-ae25-9073b349dcc7',
            name: 'wallmart',
          },
          user: {
            uuid: '4e75b65b-3f89-4c11-9fc8-a8b2a34fa86d',
          },
        })
    });
  });
});
