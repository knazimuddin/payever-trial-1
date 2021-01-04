import { FilterConditionEnum } from '../../enum';
import { StringFilterInterface } from '../interfaces';

export class IsNotInConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.IsNotIn;
  }

  public static apply(
    elasticFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    const shouldCondition: Array<{ }> = new Array<{ }>();

    for (const value of _filter.value) {
      const item: { } = { match: { [field]: value }};
      shouldCondition.push(item);
    }

    const condition: { } = {
      bool: {
        should: shouldCondition,
      },
    };

    elasticFilters.must_not.push(condition);
  }
}