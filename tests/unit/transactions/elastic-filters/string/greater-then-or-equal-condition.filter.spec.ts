import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { StringFilterInterface } from '../../../../../src/transactions/elastic-filters/interfaces';
import { GreaterThenOrEqualConditionFilter } from '../../../../../src/transactions/elastic-filters/string/greater-then-or-equal-condition.filter';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('GreaterThenOrEqualConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        GreaterThenOrEqualConditionFilter.getName(),
      ).to.equal('greaterThanOrEqual');
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
          '123',
        ],
      }
      GreaterThenOrEqualConditionFilter.apply(elasticFilters, field, _filter);
      expect(elasticFilters.must).to.deep.equal(
        [{
          range: {
            title: {
              gte: '123',
            },
          },
        }],
      );
    });
  });
});
