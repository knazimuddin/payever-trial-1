import { partialFactory, PartialFactory, SequenceGenerator } from '@pe/cucumber-sdk';
import { CurrencyModel } from '@pe/common-sdk';

const seq = new SequenceGenerator();

const defaultFactory = (): CurrencyModel => {
  seq.next();

  return ({
    _id: `currency_${seq.current}`,
    name: `Currency ${seq.current}`,
    rate: seq.current,
    symbol: `cur_${seq.current}`
  } as CurrencyModel);
};

export class currencyFactory {
  public static create: PartialFactory<CurrencyModel> = partialFactory<CurrencyModel>(defaultFactory);
}
