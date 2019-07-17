import { snakeCase } from 'lodash';

export class SortingDto {
  constructor(
    public field: string,
    public direction: string,
  ) {
    this.field = snakeCase(field);
    this.direction = direction.toLowerCase();
  }
}
