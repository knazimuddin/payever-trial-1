import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { StringFilterInterface } from '../../../../../src/transactions/elastic-filters/interfaces';
import { IsNotConditionFilter } from '../../../../../src/transactions/elastic-filters/string/is-not-condition.filter';

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
    it('should apply the given feild to elastic filter', async () => {
      const elasticFilters: any = {
        must: [],
        must_not: [],
      };
      const field: string = 'title';
      const _filter: StringFilterInterface = {
        value: [
          'iphone',
        ],
      }
      IsNotConditionFilter.apply(elasticFilters, field, _filter);
      expect(elasticFilters.must_not[0]).to.deep.equal(
        {
          match_phrase: {
            title: 'iphone',
          },
        },
      );
    });
  });
});
