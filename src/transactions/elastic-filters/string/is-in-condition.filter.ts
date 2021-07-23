import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class IsInConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.isIn;
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

    elasticFilters.must.push(condition);
  }
}
