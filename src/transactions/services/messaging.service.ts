import { Injectable, HttpService } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { environment } from '../../environments';

@Injectable()
export class MessagingService {

  constructor(private readonly httpService: HttpService) {}

  async getActionsList() {
  }

  async runAction() {
  }

  private async getCredentials(paymentOptionId: string) {
    // https://showroom63.payever.de/api/rest/v1/business-payment-option/3
    this.httpService.get(`${environment.checkoutMicroUrlBase}api/rest/v1/business-payment-option/${paymentOptionId}`).pipe(
      map((paymentOption: any) => paymentOption.credentials),
    );
  }

  private async getPaymentFlow(paymentId: string) {
    this.httpService.get(`${environment.checkoutMicroUrlBase}api/rest/v1/checkout/payment/${paymentId}`).pipe(
      // setup map
      // map((paymentOption: any) => paymentOption.credentials),
    );
  }

}
