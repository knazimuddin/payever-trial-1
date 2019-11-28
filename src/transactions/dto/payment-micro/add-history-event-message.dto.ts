import { IsString, IsNotEmpty, ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentIdentifiersDto } from './payment-identifiers.dto';
import { HistoryEventDataDto } from './history-event-data.dto';

export class AddHistoryEventMessageDto {
  @IsString()
  @IsNotEmpty()
  public history_type: string;

  @IsString()
  @IsNotEmpty()
  public action: string;

  @ValidateNested()
  @IsDefined()
  @Type(() => PaymentIdentifiersDto)
  public payment: PaymentIdentifiersDto;

  @ValidateNested()
  @IsDefined()
  @Type(() => HistoryEventDataDto)
  public data: HistoryEventDataDto;
}
