import { FilterConditionEnum } from '../../enum';
import { StringFilterInterface } from '../interfaces';

export class IsNotConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.IsNot;
  }

  public static apply(
    mongoFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    mongoFilters.$and.push({
      [field]: {
        $nin: _filter.value,
      },
    });
  }
}
