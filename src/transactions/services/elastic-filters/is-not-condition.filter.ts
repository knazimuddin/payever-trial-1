import { FilterConditionEnum } from '../../enum';

export class IsNotConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.IsNot;
  }

  public static apply(
    elasticFilters: any,
    field: string,
    _filter: any,
  ): void {
    for (const value of _filter.value) {
      const condition: {} = {
        match_phrase: {
          [field]: value,
        },
      };
      elasticFilters.must_not.push(condition);
    }
  }
}
