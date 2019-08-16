import { FilterConditionEnum } from '../../enum';
import { StringFilterInterface } from '../interfaces';

export class EndsWithConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.EndsWith;
  }

  public static apply(
    mongoFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    if (_filter.value.length) {
      const regex: RegExp[] = [];
      _filter.value.forEach((elem: string) => {
        regex.push(new RegExp(`${elem}$`, 'i'));
      });
      const condition: {} = {
        [field]: {
          $in: regex,
        },
      };

      mongoFilters.$and.push(condition);
    }
  }
}
