import { IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TransactionExportChannelSetDto {
  @IsString()
  @Expose({ name: 'channel_set_uuid' })
  public uuid: string;
}
