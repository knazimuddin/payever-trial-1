import { BusinessDto } from '@pe/business-kit';
import { SampleProductDto } from '../dto';

export interface SampleProductPayloadDto {
  business: BusinessDto;
  products: SampleProductDto[];
}
