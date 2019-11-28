import { IsString } from 'class-validator';

export class ChannelSetUuidReferenceDto {
  @IsString()
  public uuid: string;
}
