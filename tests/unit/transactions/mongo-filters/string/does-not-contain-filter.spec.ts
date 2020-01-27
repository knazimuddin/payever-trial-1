import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';

import { StringFilterInterface } from '../../../../../src/transactions/mongo-filters/interfaces';
import { DoesNotContainConditionFilter } from '../../../../../src/transactions/mongo-filters/string/does-not-contain-condition.filter';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('DoesNotContainConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        DoesNotContainConditionFilter.getName(),
      ).to.equal('doesNotContain');
    });
  });

  describe('apply()', () => {
    it('should apply the given feild to mongo filter', async () => {
      const mongoFilters: any = {
        $and: [],
        $not: [],
      }
      const field: string = 'title';
      const _filter: StringFilterInterface = {
        value: [
          "keyword_1",
          "keyword_2",
        ],
      }
      DoesNotContainConditionFilter.apply(mongoFilters, field, _filter);
      expect(mongoFilters.$and).to.deep.equal(
        [{
          title: { $nin: [/keyword_1/i, /keyword_2/i] },
        }],
      );
    });

    it('should apply the given feild to mongo filter', async () => {
      const mongoFilters: any = {
        $and: [],
        $not: [],
      }
      const field: string = 'title';
      const _filter: StringFilterInterface = {
        value: [],
      }
      DoesNotContainConditionFilter.apply(mongoFilters, field, _filter);
      expect(mongoFilters.$and.length).equal(0);
    });

  });
});
