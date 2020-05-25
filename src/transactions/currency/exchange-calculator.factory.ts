import { Injectable } from '@nestjs/common';
import { CurrencyService } from '@pe/common-sdk';
import { ExchangeCalculator } from './exchange.calculator';

@Injectable()
export class ExchangeCalculatorFactory {
  constructor(
    private readonly currencyService: CurrencyService,
  ) { }

  public create(): ExchangeCalculator {
    return new ExchangeCalculator(this.currencyService);
  }
}
