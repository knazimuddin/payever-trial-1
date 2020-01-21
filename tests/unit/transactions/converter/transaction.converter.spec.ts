import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { CheckoutTransactionInterface } from '../../../../src/transactions/interfaces/checkout';
import { TransactionConverter } from '../../../../src/transactions/converter';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('TransactionConverter', () => {
  describe('fromCheckoutTransaction()', () => {
    it('should convert transaction from checkout transaction', async () => {
      const checkoutTransaction: CheckoutTransactionInterface = {
        address: {},
        type: 'type_1',
        payment_details: {},
        business: {
          company_email: 'hello@payever.de',
          company_name: 'payever',
          uuid: 'be52be38-d4c2-4df4-bc67-d38eda950b1d',
        },
        payment_flow: {
          id: 'b028fb87-3a8f-4bb8-b539-fd1b56903a96',
        },
        channel_set: {
          uuid: '33a96095-389f-4bf5-bf86-f8eec3561d35',
        },
        items: [
          {
            _id: '6ba09244-4e24-446c-a0c8-7978163c34b7',
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        history: [],
      } as CheckoutTransactionInterface;
      TransactionConverter.fromCheckoutTransaction(checkoutTransaction);
    });
  });
});
