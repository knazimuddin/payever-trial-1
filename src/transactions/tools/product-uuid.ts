import * as uuid5 from 'uuid/v5';

export class ProductUuid {
  public static generate(businessUuid: string, cartItemIdentifier: string): string {
    return uuid5(cartItemIdentifier, businessUuid);
  }
}
