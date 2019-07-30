export class BusinessFilter {
  public static apply(
    businessId: string,
    filters: any = {},
  ): any {
    filters.business_uuid = [{
      condition: 'is',
      value: [businessId],
    }];

    return filters;
  }
}
