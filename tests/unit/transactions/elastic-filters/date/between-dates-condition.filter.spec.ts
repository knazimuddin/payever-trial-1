import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { BetweenDatesConditionFilter } from '../../../../../src/transactions/elastic-filters/date/between-dates-condition.filter';
import { BetweenFilterInterface } from '../../../../../src/transactions/elastic-filters/interfaces';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('BetweenDatesConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        BetweenDatesConditionFilter.getName(),
      ).to.equal('betweenDates');
    });
  });

  describe('apply()', () => {
    it('should apply the given feild to elastic filter', async () => {
      const elasticFilters: any = {
        must: [],
      };
      const field: string = 'startedAt';
      const _filter: BetweenFilterInterface = {
        value: [
          {
            from: '2020-01-20',
            to: '2020-01-25',
          },
        ],
      }
      BetweenDatesConditionFilter.apply(elasticFilters, field, _filter);
      expect(elasticFilters.must[0]).to.deep.equal(
        {
          range: {
            startedAt: { gte: '2020-01-20T00:00:00.000Z', lt: '2020-01-26T00:00:00.000Z' },
          },
        },
      );
    });
  });
});
