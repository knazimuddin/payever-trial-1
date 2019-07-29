import { DateStringHelper } from '../../converter';
import { FilterConditionEnum } from '../../enum';
import { StringFilterInterface } from '../interfaces';

export class AfterDateConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.AfterDate;
  }

  public static apply(
    mongoFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    const timeStamps: number[] = _filter.value.map(
      (elem: string) => (new Date(DateStringHelper.getDateStart(elem))).getTime(),
    );

    mongoFilters.$and.push({
      [field]: {
        $gte: Math.max(...timeStamps),
      },
    });
  }
}
