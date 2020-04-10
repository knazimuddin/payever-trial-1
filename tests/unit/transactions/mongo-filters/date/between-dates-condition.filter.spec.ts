import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { BetweenFilterInterface } from '../../../../../src/transactions/elastic-filters/interfaces';
import { BetweenDatesConditionFilter } from '../../../../../src/transactions/mongo-filters/date/between-dates-condition.filter';

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
    it('should apply the given feild to mongo filter', async () => {
      const elasticFilters: any = {
        $and: [],
        $or: [],
      };
      const field: string = 'startedAt';
      const _filter: BetweenFilterInterface = {
        value: [
          {
            from: '2022-01-23',
            to: '2022-12-23',
          },
        ],
      }
      BetweenDatesConditionFilter.apply(elasticFilters, field, _filter);
      expect(elasticFilters.$and).to.deep.equal(
        [{
          startedAt: { $gte: 1642896000000, $lte: 1671840000000 },
        }],
      );
    });
  });
});
