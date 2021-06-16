import { DateStringHelper } from '../../converter';
import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class IsNotDateConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.isNotDate;
  }

  public static apply(
    mongoFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    _filter.value.forEach((elem: string) => {
      mongoFilters.$and.push({
        [field]: {
          $not: {
            $gte: DateStringHelper.getDateStart(elem),
            $lt: DateStringHelper.getTomorrowDateStart(elem),
          },
        },
      });
    });
  }
}
