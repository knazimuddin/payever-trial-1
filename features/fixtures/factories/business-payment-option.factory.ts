import uuid = require('uuid');
import { partialFactory, PartialFactory, SequenceGenerator } from '@pe/cucumber-sdk';
import { BusinessPaymentOptionModel } from '../../../src/transactions/models';

const seq = new SequenceGenerator();

const defaultBusinessPaymentOptionFactory = (): BusinessPaymentOptionModel => {
  seq.next();

  return ({
    id: seq.current,
    uuid: uuid.v4(),
    accept_fee: true,
    completed: true,
    credentials: [],
    fixed_fee: seq.current,
    options: '{}',
    payment_option_id: seq.current,
    shop_redirect_enabled: true,
    status: 'new',
    variable_fee: seq.current,
  });
};

export class businessPaymentOptionFactory {
  public static create: PartialFactory<BusinessPaymentOptionModel> = partialFactory(defaultBusinessPaymentOptionFactory);
}
