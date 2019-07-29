import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class ChangeAmountDataDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  public amount: number;
}
