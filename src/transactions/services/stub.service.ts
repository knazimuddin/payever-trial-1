import { Injectable } from '@nestjs/common';

@Injectable()
export class StubService {

  // private paymentMethods: string[] = [
  //   'santander_ccp_installment',
  //   'santander_pos_installment',
  //   'santander_factoring_de',
  //   'santander_installment',
  //   'paymill_directdebit',
  //   'paypal',
  //   'santander_invoice_de',
  //   'paymill_creditcard',
  //   'stripe',
  //   'invoice',
  //   'sofort',
  //   'cash',
  // ];
  //
  // private channels: string[] = [
  //   'magento',
  //   'wooCommerce',
  //   'finance_express',
  //   'pos',
  //   'store',
  //   'shopify',
  //   'facebook',
  //   'other_shopsystem',
  //   'marketing',
  // ];
  //
  // private statuses: string[] = [
  //   'STATUS_CANCELLED',
  //   'STATUS_FAILED',
  //   'STATUS_DECLINED',
  //   'STATUS_IN_PROCESS',
  //   'STATUS_PAID',
  //   'STATUS_REFUNDED',
  //   'STATUS_ACCEPTED',
  //   'STATUS_NEW',
  // ];
  //
  // private colors: string[] = ['green', 'yellow', 'red'];
  //
  // constructor() {}
  //
  // public createFakeTransaction(businessUuid): TransactionInterface {
  //   const items = (Array.apply(null, {length: 3})).map(() => this.createFakeTransactionItem());
  //   const customerId = Math.round(Math.random() * 1000);
  //   const history = this.createFakeHistory(items);
  //
  //   return {
  //     amount: parseFloat((Math.random() * 5000).toFixed(2)),
  //     // amount_refunded: 0,
  //     // amount_rest: 0,
  //     billing_address: this.createFakeCustomerAddress('billing'),
  //     // business_address - will be resolved on FE via business_uuid
  //     business_uuid: businessUuid,
  //     channel: this.randomFromArray(this.channels),
  //     created_at: Date.now(),
  //     currency: 'EUR',
  //     customer_email: `johndoe${customerId}@shop.com`,
  //     customer_name: `John Doe ${customerId}`,
  //     delivery_fee: 42,
  //     down_payment: 0,
  //     fee_accepted: true,
  //     history: history,
  //     items: items,
  //     merchant_email: 'merchant_email@test.com',
  //     merchant_name: 'XXXLutz',
  //     payment_details: '',
  //     payment_fee: 0,
  //     reference: `zzzz${customerId}`,
  //     shipping_address: this.createFakeCustomerAddress('shipping'),
  //     shipping_category: 'custom',
  //     shipping_method_name: 'Test name shipping',
  //     shipping_option_name: 'Flat Rate Shipping',
  //     specific_status: 'untraceable',
  //     status: this.randomFromArray(this.statuses),
  //     status_color: this.randomFromArray(this.colors),
  //     store_id: '777777',
  //     store_name: 'My lucky store',
  //     total: parseFloat((Math.random() * 5000).toFixed(2)),
  //     // total_fee: '42.42',
  //     type: this.randomFromArray(this.paymentMethods),
  //   };
  // }
  //
  // public createFakeTransactionItem() {
  //   return {
  //     description: '<p>There&#039;s no reason to mess with a good thing. Wilkie is our version of a never-fail frame with a sloped rectangular eyeframe that flatters any face.</p>',
  //     fixed_shipping_price: null,
  //     uuid: uuid(),
  //     identifier : null,
  //     // is_physical: true,
  //     item_type: 'physical',
  //     name: '32Mercrdes S500 - Sports & Outdoor item #3',
  //     price: parseFloat((Math.random() * 1000).toFixed(2)),
  //     price_net : null,
  //     quantity : this.randomFromArray([3, 4, 5]),
  //     shipping_type : 'general',
  //     thumbnail : 'https://stage.payever.de/mediaservice/products_import/0b/94/3385b823-2468-4484-ac0a-c20bd8a979bf.png',
  //     url : 'https://stage.payever.de/store/germanygermanychangednamechangednamechangednamechangednamemedia-shop-1/store/store-name-51/product/203797f2-2b11-4927-ad36-1bb4974ccc80',
  //     vat_rate : null,
  //   };
  // }
  //
  // public createFakeCustomerAddress(type: string) {
  //   return {
  //     city : 'Hamburg',
  //     company_name : null,
  //     country : 'DE',
  //     country_name : 'Germany',
  //     fax : null,
  //     first_name : `John (${type})`,
  //     last_name : 'Doe',
  //     mobile_phone : '+12341234',
  //     phone : '+23452345',
  //     salutation : 'SALUTATION_MR',
  //     social_security_number : '1234567890',
  //     street : 'Am Sandtorkai',
  //     type : type,
  //     zip_code : '20457',
  //   };
  // }
  //
  // public createFakeHistory(items: any[]) {
  //   return [
  //     {
  //       action: 'create',
  //       amount: 0,
  //       created_at: Date.now(),
  //       is_restock_items: true,
  //       params: null,
  //       payment_status: null,
  //       reason: null,
  //       refund_items: [],
  //     },
  //     {
  //       action: 'refund',
  //       amount: 100,
  //       created_at: Date.now(),
  //       is_restock_items: true,
  //       params: null,
  //       payment_status: null,
  //       reason: null,
  //       refund_items: items.map((item) => ({item_uuid: item.uuid, count: this.randomFromArray([1, 2, 3])})),
  //     },
  //     {
  //       action: 'statuschanged',
  //       amount : null,
  //       created_at: Date.now(),
  //       is_items_restocked: false,
  //       payment_status: 'STATUS_DECLINED',
  //       reason: null,
  //       refund_items: [],
  //     },
  //   ];
  // }
  //
  // private randomFromArray(array) {
  //   return array[Math.floor(Math.random() * array.length)];
  // }
}
