import { PagingData } from './paging-data.dto';

export class PagingResultDto {
  public collection: any[];
  public pagination_data: PagingData;
  public aggregations: {
    amount: number,
  };
  public filters: any = {};
  public usage: any = {};
}
