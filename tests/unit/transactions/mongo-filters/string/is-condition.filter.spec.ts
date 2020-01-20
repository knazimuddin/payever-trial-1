import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { StringFilterInterface } from '../../../../../src/transactions/mongo-filters/interfaces';
import { IsConditionFilter } from '../../../../../src/transactions/mongo-filters/string/is-condition.filter';


chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('IsConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        IsConditionFilter.getName(),
      ).to.equal('is');
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
      IsConditionFilter.apply(mongoFilters, field, _filter);
      expect(mongoFilters.$and[0]).to.deep.equal(
        {
          tags: { $in: ['tag1', 'tag2'] },
        },
      );
    });
  });
});
