import { IsString, IsOptional } from 'class-validator';
import { UnpackedDetailsInterface } from '../../interfaces/transaction';

export class TransactionPaymentDetailsDto implements UnpackedDetailsInterface{
  @IsString()
  @IsOptional()
  public finance_id?: string;
  @IsString()
  @IsOptional()
  public application_no?: string;
  @IsString()
  @IsOptional()
  public application_number?: string;
  @IsString()
  @IsOptional()
  public usage_text?: string;
  @IsString()
  @IsOptional()
  public pan_id?: string;
  @IsString()
  @IsOptional()
  public iban?: string;
  @IsString()
  @IsOptional()
  public bank_i_b_a_n?: string;
}
