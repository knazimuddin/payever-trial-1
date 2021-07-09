import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class IsConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.is;
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
