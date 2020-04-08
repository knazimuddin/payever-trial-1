import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { StringFilterInterface } from '../../../../../src/transactions/elastic-filters/interfaces';
import { StartsWithConditionFilter } from '../../../../../src/transactions/elastic-filters/string/starts-with-condition.filter';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('StartsWithConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        StartsWithConditionFilter.getName(),
      ).to.equal('startsWith');
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
          'keyword',
        ],
      }
      StartsWithConditionFilter.apply(elasticFilters, field, _filter);
      expect(elasticFilters.must).to.deep.equal(
        [{
          query_string: {
            fields: [
              'title^1',
            ],
            query: 'keyword*',
          },
        }],
      );
    });
  });
});
