import { DateStringHelper } from '../../converter';
import { FilterConditionEnum } from '@pe/common-sdk';
import { BetweenFilterInterface } from '../interfaces';

export class BetweenDatesConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.betweenDates;
  }

  public static apply(
    mongoFilters: any,
    field: string,
    _filter: BetweenFilterInterface,
  ): void {
    const from: number[] = _filter.value.map(
      (elem: { from: string }) => (new Date(DateStringHelper.getDateStart(elem.from))).getTime(),
    );
    const to: number[] = _filter.value.map(
      (elem: { to: string }) => (new Date(DateStringHelper.getTomorrowDateStart(elem.to))).getTime(),
    );

    mongoFilters.$and.push({
      [field]: {
        $gte: Math.max(...from),
        $lte: Math.min(...to),
      },
    });
  }
}
