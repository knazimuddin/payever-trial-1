import * as uuid from 'uuid';
import { partialFactory, PartialFactory, SequenceGenerator } from '@pe/cucumber-sdk';
import { TransactionModel } from '../../../src/transactions/models';

const seq = new SequenceGenerator();

const defaultTransactionFactory = (): TransactionModel => {
  seq.next();

  return ({
    action_running : false,
    santander_applications : [],
    uuid : uuid.v4(),
    status : 'STATUS_PAID',
    currency : 'EUR',
    customer_name : `Customer ${seq.current}`,
    customer_email : `test_${seq.current}@test.com`,
    channel : 'pos',
    amount : 100,
    total : 100,
    items : [
      {
        'uuid' : uuid.v4(),
        'name' : `test item #${seq.current}`,
        'identifier': uuid.v4(),
        'price' : 100,
        'price_net' : 0,
        'vat_rate' : 0,
        'quantity' : 1,
        'thumbnail' : `https://payeverstaging.blob.core.windows.net/products/image_${seq.current}`,
      }
    ],
    payment_details: `{}`,
    business_option_id: 34679,
    reference: uuid.v4(),
    delivery_fee: 0,
    payment_fee: 0,
    down_payment: 0,
    shipping_method_name: `shipping_method_${seq.current}`,
    billing_address: {
      salutation: 'SALUTATION_MR',
      first_name : `First_name_${seq.current}`,
      last_name : `Last_name_${seq.current}`,
      email : `test_${seq.current}@test.com`,
      country : 'DE',
      country_name : 'Germany',
      city : 'Hamburg',
      zip_code : '12345',
      street : 'Rödingsmarkt',
    },
    type : `type_${seq.current}`,
    business_uuid : uuid.v4(),
    merchant_name : `test_merchant_${seq.current}`,
    merchant_email : `testcases_${seq.current}@merchant.com`,
    payment_flow_id : uuid.v4(),
    channel_set_uuid : uuid.v4(),
    original_id : uuid.v4(),
    history : [],
    place : 'paid',
    specific_status : 'PAID',
    shipping_address : {
      salutation: 'SALUTATION_MR',
      first_name : `First_name_${seq.current}`,
      last_name : `Last_name_${seq.current}`,
      email : `test_${seq.current}@test.com`,
      country : 'DE',
      country_name : 'Germany',
      city : 'Hamburg',
      zip_code : '12345',
      street : 'Rödingsmarkt',
    },
    shipping_order_id : uuid.v4(),
    created_at: new Date(),
    updated_at: new Date(),
  } as TransactionModel);
};

export class transactionFactory {
  public static create: PartialFactory<TransactionModel> = partialFactory<TransactionModel>(defaultTransactionFactory);
}
