import { DateStringHelper } from '../../converter';
import { FilterConditionEnum } from '../../enum';
import { StringFilterInterface } from '../interfaces';

export class BeforeDateConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.BeforeDate;
  }

  public static apply(
    elasticFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    const timeStamps: number[] = _filter.value.map(
      (elem: string) => (new Date(DateStringHelper.getTomorrowDateStart(elem))).getTime(),
    );
    const condition: { } = {
      range: {
        [field]: {
          lt: (new Date(Math.min(...timeStamps))).toISOString(),
        },
      },
    };
    elasticFilters.must.push(condition);
  }
}
