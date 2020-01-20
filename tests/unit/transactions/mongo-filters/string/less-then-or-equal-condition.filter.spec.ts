import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { StringFilterInterface } from '../../../../../src/transactions/mongo-filters/interfaces';
import { LessThenOrEqualConditionFilter } from '../../../../../src/transactions/mongo-filters/string/less-then-or-equal-condition.filter';


chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('LessThenOrEqualConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        LessThenOrEqualConditionFilter.getName(),
      ).to.equal('lessThanOrEqual');
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
      LessThenOrEqualConditionFilter.apply(mongoFilters, field, _filter);
      expect(mongoFilters.$and[0]).to.deep.equal(
        {
          amount: { $lte: 123 },
        },
      );
    });
  });
});
