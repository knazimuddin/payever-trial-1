import * as uuid from 'uuid';

export class ProductUuid {
  public static generate(businessUuid: string, cartItemIdentifier: string): string {
    return uuid.v5(cartItemIdentifier, businessUuid);
  }
}
