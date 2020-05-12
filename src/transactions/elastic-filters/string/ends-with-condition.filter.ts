import { FilterConditionEnum } from '../../enum';
import { StringFilterInterface } from '../interfaces';

export class EndsWithConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.EndsWith;
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
