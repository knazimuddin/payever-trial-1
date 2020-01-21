import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';
import { TransactionBasicInterface } from '../../../../src/transactions/interfaces';
import { TransactionDoubleConverter } from '../../../../src/transactions/converter';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('TransactionDoubleConverter', () => {

  const transaction: TransactionBasicInterface = {
    amount: 123.288,
    total: 456.29,
    delivery_fee: 12.232,
    down_payment: 23.422,
    payment_fee: 2.9,
    items: [
      {
        price: 400.2,
        price_net: 399.23,
        vat_rate: 13.522,
        fixed_shipping_price: 4.299,
        shipping_price: 3.929,
        shipping_settings_rate: 5.5,
        weight: 1,
      },
      {},
    ],
    history: [
      {
        action: 'action_1',
        amount: 51.232,
      },
      {
        action: 'action_2',
      },
    ],
  } as any;

  describe('pack()', () => {
    it('should pack transaction', async () => {
      expect(
        TransactionDoubleConverter.pack(transaction),
      ).to.deep.equal(
        {
          amount: 12328,
          total: 45629,
          delivery_fee: 1223,
          down_payment: 2342,
          payment_fee: 290,
          items: [
            {
              price: 40020,
              price_net: 39923,
              vat_rate: 1352,
              fixed_shipping_price: 429,
              shipping_price: 392,
              shipping_settings_rate: 550,
              weight: 100,
            },
            {
              price: undefined,
              price_net: undefined,
              vat_rate: undefined,
              fixed_shipping_price: undefined,
              shipping_price: undefined,
              shipping_settings_rate: undefined,
              weight: undefined,
            },
          ],
          history: [
            {
              action: 'action_1',
              amount: 5123,
            },
            {
              action: 'action_2',
              amount: undefined,
            },
          ],
        },
      )
    });
  });
});
