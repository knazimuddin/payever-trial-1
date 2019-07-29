import { DateStringHelper } from '../../converter';
import { FilterConditionEnum } from '../../enum';
import { StringFilterInterface } from '../interfaces';

export class IsNotDateConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.IsNotDate;
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
