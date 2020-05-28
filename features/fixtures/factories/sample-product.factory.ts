import { partialFactory, SequenceGenerator } from '@pe/cucumber-sdk';
import * as uuid from 'uuid';

const seq = new SequenceGenerator(1);

const sampleProductDefaultFactory = () => {
  seq.next();

  return {
    _id: uuid.v4(),
    uuid: uuid.v4(),
    industry: 'BRANCHE_FASHION',
    product: 'BUSINESS_PRODUCT_RETAIL_B2C',
    description: `Product ${seq.current} description`,
    identifier:  '',
    name: `Product ${seq.current}`,
    price: 100,
    price_net: 0,
    quantity: 1,
    vat_rate: 19,
    created_at: new Date(),
    updated_at: new Date(),
    images: [
      'http://image1.url',
    ],
  };
};

export const sampleProductFactory = partialFactory(sampleProductDefaultFactory);
