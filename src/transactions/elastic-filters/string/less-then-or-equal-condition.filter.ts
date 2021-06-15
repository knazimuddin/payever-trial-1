import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class LessThenOrEqualConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.lessThanOrEqual;
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
            lte: value,
          },
        },
      };
      elasticFilters.must.push(condition);
    }
  }
}
