import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class DoesNotContainConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.doesNotContain;
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
          $nin: regex,
        },
      });
    }
  }
}
