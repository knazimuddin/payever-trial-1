import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';

import { StringFilterInterface } from '../../../../../src/transactions/elastic-filters/interfaces';
import { AfterDateConditionFilter } from '../../../../../src/transactions/mongo-filters/date/after-date-condition.filter';

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
    it('should apply the given feild to mongo filter', async () => {
      const mongoFilters: any = {
        $and: [],
        $or: [],
      };
      const field: string = 'startedAt';
      const _filter: StringFilterInterface = {
        value: [
          '2022-01-23',
        ],
      }
      AfterDateConditionFilter.apply(mongoFilters, field, _filter);
      expect(mongoFilters.$and[0]).to.deep.eq(
        {
          startedAt: {
            $gte: 1642896000000,
          },
        },
      )
    });
  });
});
