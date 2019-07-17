import { FilterConditionEnum } from '../enum';
import { StringFilterInterface } from './interfaces';

export class GreaterThenConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.GreaterThan;
  }

  public static apply(
    elasticFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    for (const value of _filter.value) {
      const condition: {} = {
        range: {
          [field]: {
            gt: value,
          },
        },
      };
      elasticFilters.must.push(condition);
    }
  }
}
