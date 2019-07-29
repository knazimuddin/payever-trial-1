import { Injectable, Logger } from '@nestjs/common';
import { MessageBusService, MessageInterface } from '@pe/nest-kit/modules/message';

import { environment } from '../../environments';

const ORIGINAL_TIMEOUT: number = 15;

@Injectable()
export class PaymentsMicroService {
  private readonly stubMessageName: string = 'payment_option.stub_proxy.sandbox';

  private messageBusService: MessageBusService = new MessageBusService(
    {
      rsa: environment.rsa,
    },
    this.logger);

  constructor(private readonly logger: Logger) {
  }

  public createPaymentMicroMessage(
    paymentType: string,
    messageIdentifier: string,
    messageData: any,
    stub: boolean = false,
  ): MessageInterface {
    const messageName: string = `payment_option.${paymentType}.${messageIdentifier}`;
    const message: MessageInterface = this.messageBusService.createMessage(messageName, messageData);

    if (stub && this.getMicroName(paymentType)) {
      message.name = this.stubMessageName;
      message.payload.microservice_data = {
        message_identifier: messageIdentifier,
        message_name: messageName,
        microservice_name: this.getMicroName(paymentType),
        original_timeout: ORIGINAL_TIMEOUT,
        payment_method: paymentType,
      };
    }

    return message;
  }

  // TODO add enum for payment type
  public getChannelByPaymentType(paymentType: string, stub: boolean = false): string {
    const microName: string = this.getMicroName(paymentType);

    if (microName) {
      return stub ? 'rpc_payment_stub_proxy' : `rpc_${microName}`;
    } else {
      return 'rpc_checkout_micro';
    }
  }

  public getMicroName(paymentType: string): string {
    // TODO - enums?
    switch (paymentType) {
      case 'santander_installment':
      case 'santander_ccp_installment':
      case 'santander_pos_installment':
        return 'payment_santander_de';
      case 'santander_invoice_de':
      case 'santander_pos_invoice_de':
        return 'payment_santander_invoice_de';
      case 'santander_factoring_de':
      case 'santander_pos_factoring_de':
        return 'payment_santander_factoring_de';
      case 'santander_installment_no':
      case 'santander_pos_installment_no':
      case 'santander_invoice_no':
      case 'santander_pos_invoice_no':
        return 'payment_santander_no';
      case 'santander_installment_dk':
        return 'payment_santander_dk';
      case 'santander_installment_se':
      case 'santander_pos_installment_se':
        return 'payment_santander_se';
      case 'sofort':
        return 'payment_sofort';
      case 'paypal':
        return 'payment_paypal';
      case 'stripe':
      case 'stripe_directdebit':
        return 'payment_stripe';
      case 'payex_creditcard':
      case 'payex_faktura':
        return 'payment_payex';
      case 'cash':
        return 'payment_wiretransfer';
      default:
        return null;
    }
  }
}
