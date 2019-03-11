import { Injectable, HttpService } from "@nestjs/common";

import { CurrencyInterface } from "../interfaces";
import { environment } from "../../environments";

@Injectable()
export class CurrencyExchangeService {
  private _currencies: CurrencyInterface[]
  
  constructor(
    private readonly http: HttpService,
  ) {
  }
  

  public async getCurrencyExchanges(): Promise<CurrencyInterface[]> {
    if (this._currencies) {
      return this._currencies;
    }
    else {
      const request = this.http.get<CurrencyInterface[]>(`${environment.connectMicroUrlBase}/api/currency`);
      const response = await request.toPromise();
      this._currencies = response.data;

      return this._currencies;
    }
  }
}