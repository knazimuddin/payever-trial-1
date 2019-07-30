import { FilterConditionEnum } from '../../enum';
import { StringFilterInterface } from '../interfaces';

export class IsConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.Is;
  }

  public static apply(
    mongoFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    mongoFilters.$and.push({
      [field]: {
        $in: _filter.value,
      },
    });
  }
}
