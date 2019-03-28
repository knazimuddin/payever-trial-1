import { IsOptional, IsString } from 'class-validator';

export class UpdateDataInfoDto {
  @IsOptional()
  @IsString()
  public deliveryFee: string;

  // Product Items array. Is it really required will all fields?
  @IsOptional()
  public productLine: any[];
}
