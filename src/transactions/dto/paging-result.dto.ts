export class PagingResultDto {
  public collection: any[];
  public pagination_data: PagingData;
  public filters: any = {};
  public usage: any = {};
}

export class PagingData {
  public totalCount: number;
  public total: number;
  public current: number;
}