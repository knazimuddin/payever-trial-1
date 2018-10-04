import { Injectable, HttpService } from '@nestjs/common';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments';

@Injectable()
export class MessagingService {

  constructor(private readonly httpService: HttpService) {}

  async getCredentials(transaction: any) {
    if (transaction.channel_set_id) {
      // remove this branch when all transaction.business_option_id will be synced with new DB
      const paymentOptionsList = (await this.httpService.get(`${environment.checkoutMicroUrlBase}api/rest/v1/payment-options`).toPromise()).data as any[];
      const paymentOption = paymentOptionsList.find((po) => po.payment_method === transaction.type);
      const businessPaymentOptions = (await this.httpService.get(`${environment.checkoutMicroUrlBase}api/rest/v1/business-payment-option/channel-set/${transaction.channel_set_id}`).toPromise()).data as any[];
      const businessPaymentOption = businessPaymentOptions.find((bpo) => bpo.payment_option_id === paymentOption.id);
      const paymentMethodData = (await this.httpService.get(`${environment.checkoutMicroUrlBase}api/rest/v1/business-payment-option/${businessPaymentOption.id}`).toPromise()).data;
      return paymentMethodData.credentials;
    } else {
      console.log('check business payment option id', transaction.business_option_id);
      console.log(`${environment.checkoutMicroUrlBase}api/rest/v1/business-payment-option/${transaction.business_option_id}`);
      const paymentMethodData = (await this.httpService.get(`${environment.checkoutMicroUrlBase}api/rest/v1/business-payment-option/${transaction.business_option_id}`).toPromise()).data;
      return paymentMethodData.credentials;
    }
  }

}
