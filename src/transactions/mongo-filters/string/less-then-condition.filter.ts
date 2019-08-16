import { FilterConditionEnum } from '../../enum';
import { StringFilterInterface } from '../interfaces';

export class LessThenConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.LessThan;
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
        $lt: Math.min(...numbers),
      },
    });
  }
}
