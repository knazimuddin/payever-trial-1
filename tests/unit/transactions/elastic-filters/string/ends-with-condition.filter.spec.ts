import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { StringFilterInterface } from '../../../../../src/transactions/elastic-filters/interfaces';
import { EndsWithConditionFilter } from '../../../../../src/transactions/elastic-filters/string/ends-with-condition.filter';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('EndsWithConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        EndsWithConditionFilter.getName(),
      ).to.equal('endsWith');
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
      EndsWithConditionFilter.apply(elasticFilters, field, _filter);
      expect(elasticFilters.must).to.deep.equal(
        [{
          query_string: {
            fields: [
              'title^1',
            ],
            query: '*keyword',
          },
        }],
      );
    });
  });
});
