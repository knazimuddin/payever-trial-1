export class IsNotTestModeFilter {
  public static apply(
    filters: any = { },
  ): any {
    if (filters.test_mode) {
      return filters;
    }

    filters.test_mode = [{
      condition: 'isNot',
      value: [true],
    }];

    return filters;
  }
}
