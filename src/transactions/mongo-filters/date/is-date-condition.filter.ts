import { DateStringHelper } from '../../converter';
import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class IsDateConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.isDate;
  }

  public static apply(
    mongoFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    _filter.value.forEach((elem: string) => {
      mongoFilters.$and.push({
        [field]: {
          $gte: DateStringHelper.getDateStart(elem),
          $lt: DateStringHelper.getTomorrowDateStart(elem),
        },
      });
    });
  }
}
