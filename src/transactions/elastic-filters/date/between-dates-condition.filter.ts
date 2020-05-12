import { DateStringHelper } from '../../converter';
import { FilterConditionEnum } from '../../enum';
import { BetweenFilterInterface } from '../interfaces';

export class BetweenDatesConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.BetweenDates;
  }

  public static apply(
    elasticFilters: any,
    field: string,
    _filter: BetweenFilterInterface,
  ): void {
    const from: number[] = _filter.value.map(
      (elem: { from: string }) => (new Date(DateStringHelper.getDateStart(elem.from))).getTime(),
    );
    const to: number[] = _filter.value.map(
      (elem: { to: string }) => (new Date(DateStringHelper.getTomorrowDateStart(elem.to))).getTime(),
    );

    const condition: { } = {
      range: {
        [field]: {
          gte: (new Date(Math.max(...from))).toISOString(),
          lt: (new Date(Math.min(...to))).toISOString(),
        },
      },
    };
    elasticFilters.must.push(condition);
  }
}
