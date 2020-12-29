import { AfterDateConditionFilter } from './date/after-date-condition.filter';
import { BeforeDateConditionFilter } from './date/before-date-condition.filter';
import { BetweenDatesConditionFilter } from './date/between-dates-condition.filter';
import { IsDateConditionFilter } from './date/is-date-condition.filter';
import { IsNotDateConditionFilter } from './date/is-not-date-condition.filter';
import { BetweenConditionFilter } from './string/between-condition.filter';
import { ContainsConditionFilter } from './string/contains-condition.filter';
import { DoesNotContainConditionFilter } from './string/does-not-contain-condition.filter';
import { EndsWithConditionFilter } from './string/ends-with-condition.filter';
import { GreaterThenConditionFilter } from './string/greater-then-condition.filter';
import { GreaterThenOrEqualConditionFilter } from './string/greater-then-or-equal-condition.filter';
import { IsConditionFilter } from './string/is-condition.filter';
import { IsNotConditionFilter } from './string/is-not-condition.filter';
import { LessThenConditionFilter } from './string/less-then-condition.filter';
import { LessThenOrEqualConditionFilter } from './string/less-then-or-equal-condition.filter';
import { StartsWithConditionFilter } from './string/starts-with-condition.filter';
import { IsInConditionFilter } from './string/is-in-condition.filter';
import { IsNotInConditionFilter } from './string/is-not-in-condition.filter';

export const FiltersList: any[] = [
  AfterDateConditionFilter,
  BeforeDateConditionFilter,
  BetweenDatesConditionFilter,
  IsDateConditionFilter,
  IsNotDateConditionFilter,
  BetweenConditionFilter,
  ContainsConditionFilter,
  DoesNotContainConditionFilter,
  EndsWithConditionFilter,
  GreaterThenConditionFilter,
  GreaterThenOrEqualConditionFilter,
  IsConditionFilter,
  IsNotConditionFilter,
  LessThenConditionFilter,
  LessThenOrEqualConditionFilter,
  StartsWithConditionFilter,
  IsInConditionFilter,
  IsNotInConditionFilter,
];
