import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { ContainsConditionFilter } from '../../../../../src/transactions/elastic-filters/string/contains-condition.filter';
import { StringFilterInterface } from '../../../../../src/transactions/elastic-filters/interfaces';
import { DoesNotContainConditionFilter } from '../../../../../src/transactions/elastic-filters/string/does-not-contain-condition.filter';

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
    it('should apply the given feild to elastic filter', async () => {
      const elasticFilters: any = {
        must: [],
        must_not: [],
      };
      const field: string = 'shipping_cost';
      const _filter: StringFilterInterface = {
        value: [
          'keyword',
        ],
      }
      DoesNotContainConditionFilter.apply(elasticFilters, field, _filter);
      expect(elasticFilters.must_not).to.deep.equal(
        [{
          query_string: {
            fields: [
              'shipping_cost^1',
            ],
            query: '*keyword*',
          },
        }],
      );
    });
  });
});
