import { snakeCase } from 'lodash';

export class SortDto {
  constructor(
    public field: string,
    public direction: string,
  ) {
    this.field = snakeCase(field);
    this.direction = direction.toLowerCase();
  }
}
