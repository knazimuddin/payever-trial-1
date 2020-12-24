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
    const condition: { } = {
      match_phrase: {
        [field]: {
          or: { ..._filter.value},
        },
      },
    };

    elasticFilters.must_not.push(condition);
  }
}
