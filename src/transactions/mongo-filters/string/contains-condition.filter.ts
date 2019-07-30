import { FilterConditionEnum } from '../../enum';
import { StringFilterInterface } from '../interfaces';

export class ContainsConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.Contains;
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
