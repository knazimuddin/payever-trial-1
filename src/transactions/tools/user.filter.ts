export class UserFilter {
  public static apply(
    userId: string,
    filters: any = { },
  ): any {
    filters.user_uuid = [{
      condition: 'is',
      value: [userId],
    }];

    return filters;
  }
}
