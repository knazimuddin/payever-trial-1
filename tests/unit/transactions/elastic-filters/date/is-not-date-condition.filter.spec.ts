import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { IsNotDateConditionFilter } from '../../../../../src/transactions/elastic-filters/date/is-not-date-condition.filter';
import { StringFilterInterface } from '../../../../../src/transactions/elastic-filters/interfaces';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('IsNotDateConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        IsNotDateConditionFilter.getName(),
      ).to.equal('isNotDate');
    });
  });

  describe('apply()', () => {
    it('should apply the given feild to elastic filter', async () => {
      const elasticFilters: any = {
        must: [],
        must_not: [],
      };
      const field: string = 'startedAt';
      const _filter: StringFilterInterface = {
        value: [
          '2020-01-20',
        ],
      }
      IsNotDateConditionFilter.apply(elasticFilters, field, _filter);
      expect(elasticFilters.must_not).to.deep.equal(
        [
          {
            range: {
              startedAt: { gte: '2020-01-20T00:00:00.000Z', lt: '2020-01-21T00:00:00.000Z' },
            },
          },
        ],
      );
    });
  });
});
