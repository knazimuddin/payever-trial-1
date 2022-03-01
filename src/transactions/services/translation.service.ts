import { Injectable } from '@nestjs/common';

@Injectable()
export class TranslationService {
  private language: string;
  private keys: object;

  public do(keys: object, language: string) {
    this.language = language;
    this.keys = keys;

    return this.translate();
  }

  private translate() {


  }
}
