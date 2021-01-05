import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Command, Positional } from '@pe/nest-kit';
import { Model } from 'mongoose';
import { BusinessPaymentOptionModel, TransactionModel } from '../models';
import { TransactionEventProducer } from '../producer';
import { ThirdPartyPaymentsEnum } from '../enum';
import { BusinessPaymentOptionService } from '../services';

@Injectable()
export class TransactionsExportForBlankMigrateCommand {
  constructor(
    @InjectModel('Transaction') private readonly transactionsModel: Model<TransactionModel>,
    private readonly transactionsEventProducer: TransactionEventProducer,
    private readonly businessPaymentOptionService: BusinessPaymentOptionService,
  ) { }

  @Command({ command: 'transactions:export:blank-migrate', describe: 'Migrate transactions to fill new services' })
  public async transactionsMigrate(
    @Positional({
      name: 'after',
    }) after: string,
    @Positional({
      name: 'before',
    }) before: string,
    @Positional({
      name: 'only_third_party',
    }) onlyThirdParty: boolean,
    @Positional({
      name: 'original_id',
    }) originalId: string,
    @Positional({
      name: 'payment_method',
    }) paymentMethod: string,
  ): Promise<void> {
    const criteria: any = { example: null };
    if (before || after) {
      criteria.created_at = { };
    }
    if (before) {
      criteria.created_at.$lte = new Date(before);
    }
    if (after) {
      criteria.created_at.$gte = new Date(after);
    }
    if (onlyThirdParty) {
      criteria.type = {
        $in: Object.values(ThirdPartyPaymentsEnum),
      };
    }
    if (paymentMethod) {
      criteria.type = paymentMethod;
    }
    if (originalId) {
      criteria.original_id = originalId;
    }

    Logger.log(`Starting transactions blank migrate`);
    Logger.log(`Criteria is ${JSON.stringify(criteria, null, 2)}.`);

    const count: number = await this.transactionsModel.countDocuments(criteria);
    Logger.log(`Found ${count} records.`);

    const limit: number = 1000;
    let start: number = 0;
    let transactions: TransactionModel[] = [];
    let processed: number = 0;

    while (start < count) {
      transactions = await this.getWithLimit(start, limit, criteria);

      Logger.log(`Starting next ${transactions.length} transactions.`);

      start += limit;
      processed += transactions.length;

      for (const transactionModel of transactions) {
        const bpoModel: BusinessPaymentOptionModel =
          await this.businessPaymentOptionService.findOneById(transactionModel.business_option_id);
        await this.transactionsEventProducer.produceTransactionBlankMigrateEvent(transactionModel, bpoModel);
      }

      Logger.log(`Migrated ${processed} of ${count}`);
    }
  }

  private async getWithLimit(start: number, limit: number, criteria: any): Promise<TransactionModel[]> {
    return this.transactionsModel.find(
      criteria,
      null,
      {
        limit: limit,
        skip: start,
        sort: { created_at: 1 },
      },
    );
  }
}
