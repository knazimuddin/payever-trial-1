import { Injectable } from '@nestjs/common';
import { CurrencyInterface } from '../interfaces';
import { CurrencyModel, CurrencyService } from '@pe/common-sdk';

@Injectable()
export class CurrencyExchangeService {
  private currencies: CurrencyInterface[];

  constructor(
    private readonly currencyService: CurrencyService,
  ) {}

  public async getCurrencyExchanges(): Promise<CurrencyInterface[]> {
    if (!this.currencies) {
      const dataList: CurrencyModel[] = await this.currencyService.findAll();
      this.currencies = [];
      for (const currency of dataList) {
        this.currencies.push({
          code: currency.id,
          rate: currency.rate,
        });
      }
    }

    return this.currencies;
  }
}
