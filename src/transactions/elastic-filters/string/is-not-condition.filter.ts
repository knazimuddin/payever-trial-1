import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class IsNotConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.isNot;
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
      elasticFilters.must_not.push(condition);
    }
  }
}
