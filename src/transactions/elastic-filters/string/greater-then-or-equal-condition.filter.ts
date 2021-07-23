import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class GreaterThenOrEqualConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.greaterThanOrEqual;
  }

  public static apply(
    elasticFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    for (const value of _filter.value) {
      const condition: { } = {
        range: {
          [field]: {
            gte: value,
          },
        },
      };
      elasticFilters.must.push(condition);
    }
  }
}
