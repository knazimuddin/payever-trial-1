import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class DoesNotContainConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.doesNotContain;
  }

  public static apply(
    elasticFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    for (const value of _filter.value) {
      const condition: { } = {
        query_string: {
          fields: [
            `${field}^1`,
          ],
          query: `*${value}*`,
        },
      };
      elasticFilters.must_not.push(condition);
    }
  }
}
