import { HttpService, Injectable } from '@nestjs/common';
import { environment } from '../../environments';

import { CurrencyInterface } from '../interfaces';

@Injectable()
export class CurrencyExchangeService {
  private currencies: CurrencyInterface[];

  constructor(
    private readonly http: HttpService,
  ) {}

  public async getCurrencyExchanges(): Promise<CurrencyInterface[]> {
    if (!this.currencies) {
      const request = this.http.get<CurrencyInterface[]>(`${environment.connectMicroUrlBase}/api/currency`);
      const response = await request.toPromise();
      this.currencies = response.data;
    }

    return this.currencies;
  }
}
