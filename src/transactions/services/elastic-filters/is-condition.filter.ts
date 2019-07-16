import { FilterConditionEnum } from '../../enum';

export class IsConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.Is;
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
      elasticFilters.must.push(condition);
    }
  }
}
