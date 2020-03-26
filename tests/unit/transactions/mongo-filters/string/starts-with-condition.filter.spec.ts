import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { StringFilterInterface } from '../../../../../src/transactions/mongo-filters/interfaces';
import { StartsWithConditionFilter } from '../../../../../src/transactions/mongo-filters/string/starts-with-condition.filter';


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
      
      expect(_filter.value).to.have.length.above(0);
      expect(_filter).to.not.be.null;
      expect(_filter.value).to.not.be.null;
      expect(_filter.value.length).to.not.be.null;
      expect(_filter).to.not.be.undefined;
      expect(_filter.value).to.not.be.undefined;
      expect(_filter.value.length).to.not.be.undefined;
      expect(_filter.value).to.have.ownProperty('length');
      StartsWithConditionFilter.apply(mongoFilters, field, _filter);
      expect(mongoFilters.$and).to.deep.equal(
        [{
          title: { $in: [/^keyword_1/i, /^keyword_2/i] },
        }],
      );
    });
  });
});
