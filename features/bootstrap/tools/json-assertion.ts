import { assert } from 'chai';
import { escapeRegExp } from 'lodash';
import { empty } from './empty';

export class JsonAssertion {
  public static assertContains(actual: any, expected: any): void {
    if (expected === '*') {
      return;
    }

    if (actual === null && !empty(expected)) {
      expected = JSON.stringify(expected);
      assert.isTrue(false, `Failed asserting that null matches expected "${expected}"`);
    }

    if (typeof(expected) === 'object') {
      Object.keys(expected).forEach(key => {
        const needle = expected[key];
        assert.hasAnyKeys(actual, [key]);
        this.assertContains(actual[key], needle);
      });

      return;
    }

    if (typeof(expected) === 'string' && expected.indexOf('*') !== -1) {
      const pattern = this.conventStringToRegexp(expected);
      assert.match(actual, pattern);

      return;
    }

    assert.equal(actual, expected);
  }

  private static conventStringToRegexp(value: string): RegExp
  {
    value.replace('*', 'replace_pattern');
    value = escapeRegExp(value);
    value.replace('replace_pattern', '(.*)');

    return new RegExp(`^${value}$`);
  }
}
