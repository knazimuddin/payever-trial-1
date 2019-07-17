export class PagingDto {
  constructor(
    public page: number,
    public limit: number,
  ) {
    this.page = +page;
    this.limit = +limit;
  }
}
