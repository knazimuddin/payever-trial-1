import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import {
  ContainsConditionFilter,
} from '../../../../../src/transactions/mongo-filters/string/contains-condition.filter';
import { StringFilterInterface } from '../../../../../src/transactions/mongo-filters/interfaces';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('ContainsConditionFilter', () => {
  describe('getName()', () => {
    it('should return name of the filter', async () => {
      expect(
        ContainsConditionFilter.getName(),
      ).to.equal('contains');
    });
  });

  describe('apply()', () => {
    it('should apply the given feild to mongo filter', async () => {
      const mongoFilters: any = {
        $and: [],
        $not: [],
      }
      const field: string = 'title';
      const _filter: StringFilterInterface = {
        value: [
          "keyword_1",
          "keyword_2",
        ],
      }
      ContainsConditionFilter.apply(mongoFilters, field, _filter);
      expect(mongoFilters.$and).to.deep.equal(
        [{
          title: { $in: [/keyword_1/i, /keyword_2/i] },
        }],
      );
    });

    it('should apply the given feild to mongo filter', async () => {
      const mongoFilters: any = {
        $and: [],
        $not: [],
      }
      const field: string = 'title';
      const _filter: StringFilterInterface = {
        value: [],
      }
      ContainsConditionFilter.apply(mongoFilters, field, _filter);
      expect(mongoFilters.$and.length).to.equal(0);
    });
  });
});
