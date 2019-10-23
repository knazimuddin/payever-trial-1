import { partialFactory, PartialFactory, SequenceGenerator } from '@pe/cucumber-sdk';
import { BusinessModel } from '../../../src/transactions/models';
import uuid = require('uuid');

const seq = new SequenceGenerator();

const defaultFactory = (): BusinessModel => {
  seq.next();

  return ({
    _id: uuid.v4(),
    currency: `EUR`,
  });
};

export class businessFactory {
  public static create: PartialFactory<BusinessModel> = partialFactory<BusinessModel>(defaultFactory);
}
