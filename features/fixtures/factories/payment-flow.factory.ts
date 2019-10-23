import uuid = require('uuid');
import { partialFactory, PartialFactory, SequenceGenerator } from '@pe/cucumber-sdk';
import { PaymentFlowModel } from '../../../src/transactions/models';

const seq = new SequenceGenerator();

const defaultFactory = (): PaymentFlowModel => {
  seq.next();

  return ({
    id: uuid.v4(),
    amount: seq.current * 100,
    currency: 'EUR',
    first_name: `First Name ${seq.current}`,
    last_name: `Last Name ${seq.current}`,
    city: `City ${seq.current}`,
    country: `Country ${seq.current}`,
    street: `Street ${seq.current}`,
    zip_code: `Zip code ${seq.current}`,
    shipping_fee: seq.current,
    shipping_method_code: `Shipping_Method_Code_${seq.current}`,
    shipping_method_name: `Shipping Method Name ${seq.current}`,
    callback: `callback_${seq.current}`,
    channel_set_uuid: uuid.v4(),
    express: false,
    origin: `Origin ${seq.current}`,
    reference: `Reference_${seq.current}`,
    salutation: `Mr.`,
    state: `State_${seq.current}`,
    step: `Step_${seq.current}`,
    tax_value: seq.current,
    x_frame_host: `x_frame_host_${seq.current}`,
  });
};

export class paymentFlowFactory {
  public static create: PartialFactory<PaymentFlowModel> = partialFactory<PaymentFlowModel>(defaultFactory);
};
