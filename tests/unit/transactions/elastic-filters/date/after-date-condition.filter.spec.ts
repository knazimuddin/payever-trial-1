import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import {
  AfterDateConditionFilter,
} from '../../../../../src/transactions/elastic-filters/date/after-date-condition.filter';
import { StringFilterInterface } from '../../../../../src/transactions/elastic-filters/interfaces';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('AfterDateConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        AfterDateConditionFilter.getName(),
      ).to.equal('afterDate');
    });
  });

  describe('apply()', () => {
    it('should apply the given feild to elastic filter', async () => {
      const elasticFilters: any = {
        must: [],
      };
      const field: string = 'startedAt';
      const _filter: StringFilterInterface = {
        value: [
          new Date('2020-01-27').toString(),
        ],
      }
      AfterDateConditionFilter.apply(elasticFilters, field, _filter);
      expect(elasticFilters.must).to.deep.eq(
        [
          {
            range: {
              startedAt: {
                gte: '2020-01-27T00:00:00.000Z',
              },
            },
          },
        ],
      )
    });
  });
});
