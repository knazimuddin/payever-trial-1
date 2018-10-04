import { Injectable } from '@nestjs/common';

import { environment } from '../../environments';

@Injectable()
export class MicroRoutingService {

  constructor() {}

  getMessageName(paymentType: string) {
    if (environment.production) {
      return `payment_option.${paymentType}.action`;
    } else {
      return `payment_option.stub_proxy.sandbox`;
    }
  }

  getChannelByPaymentType(paymentType: string): string { // @TODO add enum for payment type
    if (!environment.production) {
      // one single stub channel
      return 'rpc_payment_stub_proxy';
    }

    // @TODO invent something for payment types which are not micros?
    switch (paymentType) {
      case 'santander_installment':
      case 'santander_ccp_installment':
      case 'santander_pos_installment':
        return 'rpc_payment_santander_de';
      case 'santander_invoice_de':
        return 'rpc_payment_santander_invoice_de';
      case 'santander_factoring_de':
        return 'rpc_payment_factoring_de';
      case 'santander_installment_no':
      case 'santander_pos_installment_no':
      case 'santander_invoice_no':
      case 'santander_pos_invoice_no':
        return 'rpc_payment_santander_no';
      case 'santander_installment_dk':
        return 'rpc_payment_santander_dk';
      case 'santander_installment_se':
      case 'santander_pos_installment_se':
        return 'rpc_payment_santander_se';
      case 'sofort':
        return 'rpc_payment_sofort';
      case 'paypal':
        return 'rpc_payment_paypal';
      case 'stripe':
      case 'stripe_directdebit':
        return 'rpc_payment_stripe';
      default:
        return null;
    }
  }

}
