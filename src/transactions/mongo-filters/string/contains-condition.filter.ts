import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class ContainsConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.contains;
  }

  public static apply(
    mongoFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    if (_filter.value.length) {
      const regex: RegExp[] = [];
      _filter.value.forEach((elem: string) => {
        regex.push(new RegExp(`${elem}`, 'i'));
      });

      mongoFilters.$and.push({
        [field]: {
          $in: regex,
        },
      });
    }
  }
}
