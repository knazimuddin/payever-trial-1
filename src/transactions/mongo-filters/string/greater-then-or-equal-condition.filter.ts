import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class GreaterThenOrEqualConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.greaterThanOrEqual;
  }

  public static apply(
    mongoFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    const numbers: number[] = _filter.value.map(
      (elem: string) => Number(elem),
    );

    mongoFilters.$and.push({
      [field]: {
        $gte: Math.max(...numbers),
      },
    });
  }
}
