export class BusinessFilter {
  public static apply(
    businessId: string,
    filters: any = { },
  ): any {
    filters.businessId = [{
      condition: 'is',
      value: [businessId],
    }];

    return filters;
  }
}
