export class IsNotExampleFilter {
  public static apply(
    filters: any = { },
  ): any {
    filters.example = [{
      condition: 'isNot',
      value: [true],
    }];

    return filters;
  }
}
