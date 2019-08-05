import { Injectable } from '@nestjs/common';
import { CurrencyModel, CurrencyService } from '@pe/common-sdk';

@Injectable()
export class CurrencyExchangeService {
  private currenciesRates: Map<string, number>;

  constructor(
    private readonly currencyService: CurrencyService,
  ) {}

  public async getCurrencyExchangeRate(currencyCode): Promise<number>  {
    if (!this.currenciesRates) {
      await this.initializeCurrenciesRatesMap();
    }

    return this.currenciesRates.get(currencyCode.toUpperCase());
  }

  private async initializeCurrenciesRatesMap() {
    this.currenciesRates = new Map();
    const dataList: CurrencyModel[] = await this.currencyService.findAll();
    for (const currency of dataList) {
      this.currenciesRates.set(currency.id, currency.rate);
    }
  }
}
