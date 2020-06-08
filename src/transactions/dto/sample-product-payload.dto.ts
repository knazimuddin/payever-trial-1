import { BusinessDto, SampleProductDto } from "../dto";

export interface SampleProductPayloadDto {
  business: BusinessDto;
  products: SampleProductDto[];
}
