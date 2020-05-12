import { DateStringHelper } from '../../converter';
import { FilterConditionEnum } from '../../enum';
import { StringFilterInterface } from '../interfaces';

export class IsNotDateConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.IsNotDate;
  }

  public static apply(
    elasticFilters: any,
    field: string,
    _filter: StringFilterInterface,
  ): void {
    for (const value of _filter.value) {
      const condition: { } = {
        range: {
          [field]: {
            gte: DateStringHelper.getDateStart(value),
            lt: DateStringHelper.getTomorrowDateStart(value),
          },
        },
      };
      elasticFilters.must_not.push(condition);
    }
  }
}
