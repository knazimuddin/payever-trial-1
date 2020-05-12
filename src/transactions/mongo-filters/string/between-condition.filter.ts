import { FilterConditionEnum } from '../../enum';
import { BetweenFilterInterface } from '../interfaces';

export class BetweenConditionFilter {
  public static getName(): string {
    return FilterConditionEnum.Between;
  }

  public static apply(
    mongoFilters: any,
    field: string,
    _filter: BetweenFilterInterface,
  ): void {

    const from: number[] = _filter.value.map((elem: { from: string }) => parseInt(elem.from, 10));
    const to: number[] = _filter.value.map((elem: { to: string }) => parseInt(elem.to, 10));

    const condition: { } = {
      [field]: {
        $gte: Math.max(...from),
        $lte: Math.min(...to),
      },
    };
    mongoFilters.$and.push(condition);
  }
}
