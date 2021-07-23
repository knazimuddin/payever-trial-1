import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class LessThenConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.lessThan;
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
            lt: value,
          },
        },
      };
      elasticFilters.must.push(condition);
    }
  }
}
