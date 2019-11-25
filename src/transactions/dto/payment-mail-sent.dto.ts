import { IsString, IsNotEmpty } from 'class-validator';

export class PaymentMailSentDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsString()
  @IsNotEmpty()
  public templateName: string;

  @IsString()
  @IsNotEmpty()
  public transactionId: string;
}
