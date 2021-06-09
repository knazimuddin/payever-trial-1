import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class EndsWithConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.endsWith;
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
          query: `*${value}`,
        },
      };
      elasticFilters.must.push(condition);
    }
  }
}
