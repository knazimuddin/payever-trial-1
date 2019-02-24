import * as uuid5 from 'uuid/v5';

export class ProductUuid {
  public static generate(businessUuid: string, cartItemName: string): string {
    return uuid5(cartItemName, businessUuid);
  }
}
