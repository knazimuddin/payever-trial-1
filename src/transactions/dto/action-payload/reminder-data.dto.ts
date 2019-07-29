import { IsNumber } from 'class-validator';

export class ReminderDataDto {
  @IsNumber()
  public ChangeAmount: number;
}
