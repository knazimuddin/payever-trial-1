import { CurrencyModel, CurrencyService } from '@pe/common-sdk';

export class ExchangeCalculator {
  private ratesCache: Map<string, number> = new Map<string, number>();

  constructor(
    private readonly currencyService: CurrencyService,
  ) { }

  public async getCurrencyExchangeRate(currencyCode: string): Promise<number> {
    currencyCode = currencyCode.toUpperCase();

    if (!this.ratesCache.has(currencyCode)) {
      const currency: CurrencyModel = await this.currencyService.getCurrencyByCode(currencyCode);
      this.ratesCache.set(currency.id, currency.rate);
    }

    return this.ratesCache.get(currencyCode.toUpperCase());
  }
}
