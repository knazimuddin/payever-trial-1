import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TranslateService } from "nestjs-translate/lib/translate.service";
import { TransactionExportDto } from "../dto";
import { TransactionModel } from "../models";
import { TransactionSchemaName } from "../schemas";

export class TranslationService {
  constructor(
    @InjectModel(TransactionSchemaName)
    private readonly transactionModel: Model<TransactionModel>,
    private translateService: TranslateService
  ) {}

  public getTranslate(lang: string, key: string) {
    return this.translateService.get(lang, key);
  }
}
