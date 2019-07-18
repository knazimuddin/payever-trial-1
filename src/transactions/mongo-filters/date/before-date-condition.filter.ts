import { DateStringHelper } from '../../converter';
import { FilterConditionEnum } from '../../enum';
import { StringFilterInterface } from '../interfaces';

export class BeforeDateConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.BeforeDate;
  }

  public static apply(
    mongoFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    const timeStamps: number[] = _filter.value.map(
      (elem: string) => (new Date(DateStringHelper.getTomorrowDateStart(elem))).getTime(),
    );

    mongoFilters.$and.push({
      [field]: {
        $lt: Math.min(...timeStamps),
      },
    });
  }
}
