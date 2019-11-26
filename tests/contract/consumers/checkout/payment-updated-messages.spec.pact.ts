import 'mocha';
import { Matchers, MessageConsumerPact } from '@pact-foundation/pact';
import { asyncConsumerChecker, ExpectedMessageDto, MessageConsumerPactFactory } from '@pe/pact-kit';
import { pactConfiguration, ProvidersEnum } from '../../config';
import { RabbitRoutingKeys } from '../../../../src/enums';
import { TransactionChangedDto }  from '../../../../src/transactions/dto/checkout-rabbit';

const messages: ExpectedMessageDto[] = [
  {
    contentMatcher: {
      payment: {
        id: Matchers.like('123423'),
        uuid: Matchers.uuid(),
        business: {
          uuid: Matchers.uuid(),
          company_name: Matchers.like('Company name'),
          company_email: Matchers.like('Company@email.com'),
        },
        channel_set: {
          uuid: Matchers.uuid(),
        },
        payment_flow: {
          id: Matchers.like('123'),
          amount: Matchers.like(100),
          shipping_fee: Matchers.like(1),
          tax_value: Matchers.like(100),
          step: Matchers.like('Step'),
        },
        action_running: Matchers.like(true),
        amount: Matchers.like(10),
        business_option_id: Matchers.like(12),
        business_uuid: Matchers.uuid(),
        channel: Matchers.like('pos'),
        channel_uuid: Matchers.uuid(),
        channel_set_uuid: Matchers.uuid(),
        created_at: Matchers.iso8601DateTime(),
        currency: Matchers.like('EUR'),
        customer_email: Matchers.like('some@email.com'),
        customer_name: Matchers.like('Name'),
        delivery_fee: Matchers.like(1),
        down_payment: Matchers.like(0),
        fee_accepted: Matchers.like('fee_accepted'),
        history: Matchers.eachLike({
          action: Matchers.like('action'),
          payment_status: Matchers.like('new'),
          amount: Matchers.like(100),
          created_at: Matchers.iso8601DateTime(),
        }),
        items: Matchers.eachLike({
          uuid: Matchers.uuid(),
          description: Matchers.like('description'),
          fixed_shipping_price: Matchers.like(1),
          identifier: Matchers.like('sku'),
          item_type: Matchers.like('digital'),
          name: Matchers.like('name'),
          price: Matchers.like(100),
          price_net: Matchers.like(12),
          product_variant_uuid: Matchers.uuid(),
          quantity: Matchers.like(10),
          shipping_price: Matchers.like(1),
          shipping_settings_rate: Matchers.like(10),
          shipping_settings_rate_type: Matchers.like('custom'),
          shipping_type: Matchers.like('shipping type'),
          thumbnail: Matchers.like('image.png'),
          updated_at: Matchers.iso8601DateTime(),
          url: Matchers.like('url'),
          vat_rate: Matchers.like(23),
          weight: Matchers.like(12),
          created_at: Matchers.iso8601DateTime(),
          options: Matchers.eachLike({
            name: Matchers.like('Option name'),
            value: Matchers.like('Option value'),
          }),
        }),
        merchant_email: Matchers.like('merchant@email.com'),
        merchant_name: Matchers.like('Merchant'),
        payment_fee: Matchers.like(12),
        payment_flow_id: Matchers.like('124'),
        place: Matchers.like('place'),
        reference: Matchers.like('1234'),
        shipping_address: {
          city: Matchers.like('string'),
          company: Matchers.like('company'),
          country: Matchers.like('country'),
          country_name: Matchers.like('country_name'),
          email: Matchers.like('email'),
          fax: Matchers.like('fax'),
          first_name: Matchers.like('first_name'),
          last_name: Matchers.like('last_name'),
          mobile_phone: Matchers.like('mobile_phone'),
          phone: Matchers.like('phone'),
          salutation: Matchers.like('salutation'),
          social_security_number: Matchers.like('social_security_number'),
          type: Matchers.like('type'),
          street: Matchers.like('street'),
          zip_code: Matchers.like('zip_code'),
        },
        shipping_category: Matchers.like('Shipping category'),
        shipping_method_name: Matchers.like('dhl'),
        shipping_option_name: Matchers.like('DHL'),
        specific_status: Matchers.like('NEW'),
        status: Matchers.like('new'),
        status_color: Matchers.like('status_color'),
        store_id: Matchers.like('1234'),
        store_name: Matchers.like('Store'),
        total: Matchers.like(100),
        type: Matchers.like('type'),
        updated_at: Matchers.iso8601DateTime(),
        user_uuid: Matchers.uuid(),
        payment_type: Matchers.like('payment_type'),
        payment_details: Matchers.like({}),
      }
    },
    dtoClass: TransactionChangedDto,
    name:  RabbitRoutingKeys.PaymentUpdated,
  },
];

const messagePact: MessageConsumerPact = MessageConsumerPactFactory.fromConfig(
  pactConfiguration,
  ProvidersEnum.CheckoutPhp,
);

describe('Receive checkout payment updated bus messages', () => {
  for (const message of messages) {
    it(`Accepts valid "${message.name}" messages`, () => {
      return asyncConsumerChecker(messagePact, message)
    });
  }
});
