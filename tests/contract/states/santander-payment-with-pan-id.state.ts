import { AbstractStateFixture } from '@pe/pact-kit';
import { Model } from 'mongoose';
import {TransactionModel} from "../../../src/transactions/models";

export class SantanderPaymentWithPanIdState extends AbstractStateFixture {

  private readonly transactionModel: Model<TransactionModel>
    = this.application.get('TransactionModel');

  public getStateName(): string {
    return 'Santander payment with pan_id and application_no';
  }

  public async apply(): Promise<void> {
    await this.transactionModel.create({
      '_id' : '5d4be69cd63522000898d8d1',
      'action_running' : false,
      'santander_applications' : ['STUB_APPLICATION_NO'],
      'uuid' : 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'status' : 'STATUS_ACCEPTED',
      'currency' : 'EUR',
      'customer_name' : 'Stub Accepted',
      'customer_email' : 'customer2000@email.de',
      'channel' : 'link',
      'amount' : 200,
      'total' : 200,
      'items' : [],
      'created_at' : '2019-08-08T09:08:44.000Z',
      'updated_at' : '2019-08-28T11:19:56.000Z',
      'payment_details' : '{"unique_id":"STUB_UNIQUE_ID","usage_text":"STUB_USAGE_TEXT","basket_id":"STUB_BASKET_ID","advertising_accepted":true,"conditions_accepted":true,"birthday":"01.02.2000","pan_id":"STUB_USAGE_TEXT","application_no":"STUB_APPLICATION_NO"}',
      'business_option_id' : 34509,
      'reference' : 'stub-reference',
      'user_uuid' : 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      'delivery_fee' : 0,
      'payment_fee' : 0,
      'down_payment' : 0,
      'shipping_method_name' : '',
      'billing_address' : {
        'salutation' : 'SALUTATION_MR',
        'first_name' : 'Alfa',
        'last_name' : 'Albert',
        'email' : 'customer2000@email.de',
        'country' : 'DE',
        'country_name' : 'Germany',
        'city' : 'Heidelberg',
        'zip_code' : '12345',
        'street' : 'Vangerow12 18',
        'phone' : '496912341234',
        '_id' : '524c9a9a-7064-427b-b8bf-fc37b5441484',
      },
      'type' : 'santander_invoice_de',
      'business_uuid' : 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      'merchant_name' : 'test',
      'merchant_email' : 'testcases@payever.de',
      'payment_flow_id' : '94257d9f4794a049e7dd522be2afb019',
      'channel_set_uuid' : '4b8d0b20-24e0-4af3-8707-42037023add7',
      'original_id' : 'd35594c795c40c5499c723f793c71ffb',
      'history' : [
        {
          '_id' : '5d4be69dd63522000898d8d2',
          'action' : 'statuschanged',
          'created_at' : '2019-08-08T09:08:44.000Z',
          'payment_status' : 'STATUS_ACCEPTED',
          'refund_items' : [],
          'upload_items' : [],
        },
      ],
      '__v' : 0,
      'place' : 'accepted',
      'specific_status' : 'ACCEPTED',
    } as any);
  }
}
