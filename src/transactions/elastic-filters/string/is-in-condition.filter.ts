import { FilterConditionEnum } from '../../enum';
import { StringFilterInterface } from '../interfaces';

export class IsInConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.IsIn;
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

    elasticFilters.must.push(condition);
  }
}
