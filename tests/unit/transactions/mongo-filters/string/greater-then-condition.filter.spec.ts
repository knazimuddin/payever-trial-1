import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { StringFilterInterface } from '../../../../../src/transactions/mongo-filters/interfaces';
import { GreaterThenConditionFilter } from '../../../../../src/transactions/mongo-filters/string/greater-then-condition.filter';


chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('GreaterThenConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        GreaterThenConditionFilter.getName(),
      ).to.equal('greaterThan');
    });
  });

  describe('apply()', () => {
    it('should apply the given feild to mongo filter', async () => {
      const mongoFilters: any = {
        $and: [],
        $not: [],
      }
      const field: string = 'amount';
      const _filter: StringFilterInterface = {
        value: [
          '123',
          '456',
        ],
      }
      GreaterThenConditionFilter.apply(mongoFilters, field, _filter);
      expect(mongoFilters.$and[0]).to.deep.equal(
        {
          amount: { $gt: 456 },
        },
      );
    });
  });
});
