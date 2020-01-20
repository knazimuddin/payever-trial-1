import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { StringFilterInterface } from '../../../../../src/transactions/mongo-filters/interfaces';
import { IsNotConditionFilter } from '../../../../../src/transactions/mongo-filters/string/is-not-condition.filter';


chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('IsNotConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        IsNotConditionFilter.getName(),
      ).to.equal('isNot');
    });
  });

  describe('apply()', () => {
    it('should apply the given feild to mongo filter', async () => {
      const mongoFilters: any = {
        $and: [],
        $not: [],
      }
      const field: string = 'tags';
      const _filter: StringFilterInterface = {
        value: [
          'tag1',
          'tag2',
        ],
      }
      IsNotConditionFilter.apply(mongoFilters, field, _filter);
      expect(mongoFilters.$and[0]).to.deep.equal(
        {
          tags: { $nin: ['tag1', 'tag2'] },
        },
      );
    });
  });
});
