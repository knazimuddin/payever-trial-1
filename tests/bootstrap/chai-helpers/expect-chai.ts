import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiMatchPattern from 'chai-match-pattern';

chai.use(chaiMatchPattern);
chai.use(sinonChai);
export const matchLodash: any = chaiMatchPattern.getLodashModule();
export const chaiExpect: Chai.ExpectStatic = chai.expect;
export const chaiAssert: Chai.Assert = chai.assert;

declare global {
  export namespace Chai {
    interface Assertion {
      matchPattern(expected: any): Assertion;
    }
  }
}
