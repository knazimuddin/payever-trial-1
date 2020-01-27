import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { CheckoutTransactionInterface } from '../../../../src/transactions/interfaces/checkout';
import { TransactionConverter, TransactionDoubleConverter } from '../../../../src/transactions/converter';
import { TransactionPackedDetailsInterface } from '../../../../src/transactions/interfaces/transaction';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('TransactionConverter', () => {
  describe('fromCheckoutTransaction()', () => {
    it('should convert transaction from checkout transaction', async () => {
      const checkoutTransaction: CheckoutTransactionInterface = {
        address: {
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
        type: 'type_1',
        payment_details: {
          application_no: '1234567890',
          application_number: '987654321',
          finance_id: '1234abcd',
          usage_text: 'some usuage text',
          pan_id: 'some usuage text',
        },
        business: {
          company_email: 'hello@payever.de',
          company_name: 'payever',
          uuid: 'be52be38-d4c2-4df4-bc67-d38eda950b1d',
        },
        payment_flow: {
          id: 'b028fb87-3a8f-4bb8-b539-fd1b56903a96',
        },
        channel_set: {
          uuid: '33a96095-389f-4bf5-bf86-f8eec3561d35',
        },
        items: [
          {
            _id: '6ba09244-4e24-446c-a0c8-7978163c34b7',
            created_at: new Date('2020-01-27T08:45:16.542Z'),
            description: 'Cart Item description 1',
            fixed_shipping_price: 1.23,
            identifier: 'CartItem Identifier 1',
            item_type: 'CartItemType 1',
            name: 'CartItemName 1',
            options: [],
            price: 2.99,
            price_net: 2,
            product_uuid: 'ea2cd0b6-9271-47c5-b31a-104610e39ddb',
            product_variant_uuid: 'cd18cddb-850d-461f-bfc0-0f9c97bd944e',
            quantity: 2,
            shipping_price: 1.00,
            shipping_settings_rate: 0.4,
            shipping_settings_rate_type: 'Setting type 1',
            shipping_type: 'Standard',
            thumbnail: 'thubnail_1',
            updated_at: new Date('2020-01-27T08:50:23.621Z'),
            url: 'www.payever.de/cartitem1',
            vat_rate: 13,
            weight: 200,
          },
        ],
        created_at: '2020-01-27T09:27:41.241Z',
        updated_at: '2020-01-27T09:27:41.241Z',
        history: [],
      } as CheckoutTransactionInterface;
      console.log(TransactionConverter.fromCheckoutTransaction(checkoutTransaction));
      expect(
        TransactionConverter.fromCheckoutTransaction(checkoutTransaction),
      ).to.deep.equal(
        {
          address: {
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
            zip_code: '12344'
          },
          business: {
            company_email: 'hello@payever.de',
            company_name: 'payever',
            uuid: 'be52be38-d4c2-4df4-bc67-d38eda950b1d',
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
          channel_set: {
            uuid: '33a96095-389f-4bf5-bf86-f8eec3561d35',
          },
          payment_details: '{"application_no":"1234567890","application_number":"987654321","finance_id":"1234abcd","usage_text":"some usuage text","pan_id":"some usuage text"}',
          santander_applications: [
            '1234abcd',
            '1234567890',
            '987654321',
          ],
          type: 'type_1',
          business_uuid: 'be52be38-d4c2-4df4-bc67-d38eda950b1d',
          merchant_name: 'payever',
          merchant_email: 'hello@payever.de',
          payment_flow_id: 'b028fb87-3a8f-4bb8-b539-fd1b56903a96',
          payment_flow: {
            id: 'b028fb87-3a8f-4bb8-b539-fd1b56903a96',
          },
          channel_set_uuid: '33a96095-389f-4bf5-bf86-f8eec3561d35',
          items: [
            {
              _id: 'ea2cd0b6-9271-47c5-b31a-104610e39ddb',
              uuid: 'ea2cd0b6-9271-47c5-b31a-104610e39ddb',
              created_at: new Date('2020-01-27T08:45:16.542Z'),
              description: 'Cart Item description 1',
              fixed_shipping_price: 1.23,
              identifier: 'CartItem Identifier 1',
              item_type: 'CartItemType 1',
              name: 'CartItemName 1',
              options: [],
              price: 2.99,
              price_net: 2,
              product_variant_uuid: 'cd18cddb-850d-461f-bfc0-0f9c97bd944e',
              quantity: 2,
              shipping_price: 1.00,
              shipping_settings_rate: 0.4,
              shipping_settings_rate_type: 'Setting type 1',
              shipping_type: 'Standard',
              thumbnail: 'thubnail_1',
              updated_at: new Date('2020-01-27T08:50:23.621Z'),
              url: 'www.payever.de/cartitem1',
              vat_rate: 13,
              weight: 200,
            },
          ],
          created_at: new Date('2020-01-27T09:27:41.241Z'),
          updated_at: new Date('2020-01-27T09:27:41.241Z'),
        } ,
      )
    });
  });
});
