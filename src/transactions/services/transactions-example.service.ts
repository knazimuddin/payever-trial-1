import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectNotificationsEmitter, NotificationsEmitter } from '@pe/notifications-sdk';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { BusinessDto } from '../dto';
import { TransactionPackedDetailsInterface } from '../interfaces/transaction';
import { TransactionExampleModel, TransactionModel } from '../models';
import { TransactionExampleSchemaName } from '../schemas';
import { TransactionsService } from './transactions.service';

@Injectable()
export class TransactionsExampleService {
  constructor(
    @InjectModel(TransactionExampleSchemaName) private readonly transactionExampleModel: Model<TransactionExampleModel>,
    @InjectNotificationsEmitter() private readonly notificationsEmitter: NotificationsEmitter,
    private readonly transactionsService: TransactionsService,
  ) {}

  public async createBusinessExamples(business: BusinessDto): Promise<void> {
    const country: string = business.companyAddress.country;
    const examples: TransactionExampleModel[] = await this.transactionExampleModel.find({ country });

    for (const example of examples) {
      const raw: any = example.toObject();
      delete raw._id;
      const transactionDto: TransactionPackedDetailsInterface = {
        ...raw,
        original_id: uuid().split('-').join(''),
        uuid: uuid(),

        business_uuid: business._id,
        merchant_email: business.contactEmails.shift(),
        merchant_name: business.name,
        user_uuid: uuid(),

        created_at: new Date(),
        updated_at: new Date(),

        example: true,
      };

      await this.transactionsService.create(transactionDto);
    }
  }

  public async removeBusinessExamples(businessId: string): Promise<void> {
    const transactions: TransactionModel[] = await this.transactionsService.findCollectionByParams({
      business_uuid: businessId,
      example: true,
    });

    for (const transaction of transactions) {
      await this.transactionsService.removeByUuid(transaction.uuid);
    }
  }
}
