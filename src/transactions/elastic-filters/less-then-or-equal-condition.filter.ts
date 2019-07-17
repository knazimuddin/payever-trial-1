import { FilterConditionEnum } from '../enum';
import { StringFilterInterface } from './interfaces';

export class LessThenOrEqualConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.LessThanOrEqual;
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
            lte: value,
          },
        },
      };
      elasticFilters.must.push(condition);
    }
  }
}
