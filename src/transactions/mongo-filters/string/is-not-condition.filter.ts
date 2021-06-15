import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class IsNotConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.isNot;
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
