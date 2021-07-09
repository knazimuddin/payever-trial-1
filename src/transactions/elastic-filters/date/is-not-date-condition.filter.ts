import { DateStringHelper } from '../../converter';
import { FilterConditionEnum } from '@pe/common-sdk';
import { StringFilterInterface } from '../interfaces';

export class IsNotDateConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.isNotDate;
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
