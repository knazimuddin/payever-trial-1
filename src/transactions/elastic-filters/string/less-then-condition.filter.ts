import { FilterConditionEnum } from '../../enum';
import { StringFilterInterface } from '../interfaces';

export class LessThenConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.LessThan;
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
            lt: value,
          },
        },
      };
      elasticFilters.must.push(condition);
    }
  }
}
