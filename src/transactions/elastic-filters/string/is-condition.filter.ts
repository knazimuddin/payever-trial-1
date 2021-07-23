import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class IsConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.is;
  }

  public static apply(
    elasticFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    for (const value of _filter.value) {
      const condition: { } = {
        match_phrase: {
          [field]: value,
        },
      };
      elasticFilters.must.push(condition);
    }
  }
}
