export class PaymentItemDto {
  public uuid: string;
  public name: string;
  public price: number;
  public quantity: number;
  public vat_rate: number;
  public thumbnail: string;
  public options: any[];
}
