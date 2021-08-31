/* tslint:disable:object-literal-sort-keys */
import { BaseFixture } from '@pe/cucumber-sdk';
import { BusinessPaymentOptionModel, PaymentFlowModel, TransactionModel } from '../../../../src/transactions/models';
import { businessPaymentOptionFactory, paymentFlowFactory, transactionFactory } from '../../factories';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import {
  BusinessPaymentOptionSchemaName,
  PaymentFlowSchemaName,
  TransactionSchemaName,
} from '../../../../src/transactions/schemas';

const transactionId: string = 'ad738281-f9f0-4db7-a4f6-670b0dff5327';
const businessId: string = '36bf8981-8827-4c0c-a645-02d9fc6d72c8';
const userId: string = '08a3fac8-43ef-4998-99aa-cabc97a39261';
const businessOptionId: string = '1';
const paymentFlowId: string = '2';

class ThirdPartyPaymentFixture extends BaseFixture {
  private readonly transactionModel: Model<TransactionModel> =
    this.application.get(getModelToken(TransactionSchemaName));
  private readonly businessPaymentOptionModel: Model<BusinessPaymentOptionModel> = this.application.get(
    getModelToken(BusinessPaymentOptionSchemaName),
  );
  private readonly paymentFlowModel: Model<PaymentFlowModel> = this.application.get(
    getModelToken(PaymentFlowSchemaName),
  );

  public async apply(): Promise<void> {

    await this.transactionModel.create(transactionFactory.create({
      action_running: false,
      businessId: businessId,
      santander_applications: [ 'stub_usage_text' ],
      delivery_fee: 2,
      payment_fee: 3,
      uuid: transactionId,
      amount: 100,
      api_call_id: 'f3b35337-c74e-4f87-b679-af554211645f',
      channel: 'api',
      created_at: new Date(),
      currency: 'EUR',
      customer_email: 'test@test.com',
      customer_name: 'Stub New_transaction',
      down_payment: 0,
      reference: 'ref_12345',
      shipping_address: null,
      specific_status: 'NEW_TRANSACTION',
      status: 'STATUS_ACCEPTED',
      total: 105,
      updated_at: new Date(),
      items: [
        {
          options: null,
          _id: '86f489a6-64b7-58dc-9725-9bdbc83c2556',
          uuid: null,
          identifier: 'c4bce8c1-6572-43fc-8fc9-0f8f0a5efad1',
          name: 'test item',
          price: 50,
          price_net: 0,
          quantity: 1,
          thumbnail: 'https://payeverstaging.blob.core.windows.net/products/image_test',
          vat_rate: 0,
        },
        {
          options: null,
          _id: 'a8389e99-4b34-5650-80e3-24ed4539b4e7',
          uuid: null,
          identifier: '3a6bd3ae-3b30-41a4-803f-e457d6113279',
          name: 'test item',
          price: 25,
          price_net: 0,
          quantity: 2,
          thumbnail: 'https://payeverstaging.blob.core.windows.net/products/image_test',
          vat_rate: 0,
        },
      ],
      payment_details: '{"advertisingAccepted":true,"birthday":"1990-12-01T00:00:00.000+03:00","conditionsAccepted":true,"initializeUniqueId":"stub_unique_id","reservationUniqueId":"stub_unique_id","initializeStatusCode":"00","interestRate":7.9,"rate":3,"nominalInterestRate":3.83759,"monthlyRate":33.5,"lastRate":33.63,"totalRate":100.63,"redirectAmount":100,"riskSessionId":"8afe0fe4-277a-42c1-873e-918179206f9d","contractPdfUrl":null,"usageText":"stub_usage_text","posMerchantMode":null,"shopUserSession":"f37a40c69bf2f86f411dd5a5c6e5b5e04abe2609f7bba73c0b29404300da8a45","pan_id":"stub_usage_text"}',
      billing_address: {
      _id: '5830c385-d962-449c-9a0f-cc09bbf0fea5',
        city: 'Hamburg',
        country: 'DE',
        country_name: 'DE',
        email: 'test@test.com',
        first_name: 'Stub',
        last_name: 'New_transaction',
        phone: '42123456789',
        salutation: 'SALUTATION_MR',
        street: 'Derduf 12',
        zip_code: '12345',
      },
      type: 'santander_factoring_de',
      merchant_name: 'Factoring',
      payment_flow_id: '8f3b6b0f026025ce0802c532580a7e6f',
      original_id: '4211940e-e0e2-47ea-957b-a145f9ddacfb',
      history: [
      {
        refund_items: [],
        upload_items: [],
        _id: '5ffc1f58a7f3ed001162d2b9',
        action: 'preauthorize',
        created_at: new Date(),
      },
      ],
      refunded_items: [],
      __v: 0,
      merchant_email: null,
      },
    ));

    await this.businessPaymentOptionModel.create(businessPaymentOptionFactory.create({
      id: businessOptionId,
    }));

    await this.paymentFlowModel.create(paymentFlowFactory.create({
      id: paymentFlowId,
      uuid: 'bf86003c-27b1-46fd-a40f-ca20437e310a',
      channel_set_uuid: '7c2298a7-a172-4048-8977-dbff24dec100',
    }));
  }
}

export = ThirdPartyPaymentFixture;
