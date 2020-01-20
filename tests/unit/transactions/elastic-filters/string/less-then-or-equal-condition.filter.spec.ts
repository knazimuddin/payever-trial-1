import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { StringFilterInterface } from '../../../../../src/transactions/elastic-filters/interfaces';
import { LessThenOrEqualConditionFilter } from '../../../../../src/transactions/elastic-filters/string/less-then-or-equal-condition.filter';

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
      LessThenOrEqualConditionFilter.apply(elasticFilters, field, _filter);
      expect(elasticFilters.must[0]).to.deep.equal(
        {
          range: {
            title: {
              lte: '123',
            },
          },
        },
      );
    });
  });
});
