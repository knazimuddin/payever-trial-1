import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RabbitMqClient } from '@pe/nest-kit';
import { InjectNotificationsEmitter, NotificationsEmitter } from '@pe/notifications-sdk';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { RabbitRoutingKeys } from '../../enums';
import { BusinessDto } from '../dto';
import { TransactionPackedDetailsInterface } from '../interfaces/transaction';
import { TransactionExampleModel, TransactionModel } from '../models';
import { TransactionExampleSchemaName } from '../schemas';
import { TransactionsService } from './transactions.service';
import { TransactionEventProducer } from '../producer';

@Injectable()
export class TransactionsExampleService {
  constructor(
    @InjectModel(TransactionExampleSchemaName) private readonly transactionExampleModel: Model<TransactionExampleModel>,
    @InjectNotificationsEmitter() private readonly notificationsEmitter: NotificationsEmitter,
    private readonly transactionsService: TransactionsService,
    private readonly transactionEventProducer: TransactionEventProducer,
    private readonly rabbitClient: RabbitMqClient,
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

      const created: TransactionModel = await this.transactionsService.create(transactionDto);

      await this.rabbitClient
        .send(
          {
            channel: RabbitRoutingKeys.TransactionsPaymentAdd,
            exchange: 'async_events',
          },
          {
            name: RabbitRoutingKeys.TransactionsPaymentAdd,
            payload: {
              amount: created.amount,
              business: {
                id: created.business_uuid,
              },
              channel_set: {
                id: created.channel_set_uuid,
              },
              date: created.updated_at,
              id: created.uuid,
              items: created.items,
            },
          },
        )
      ;
    }
  }

  public async removeBusinessExamples(businessId: string): Promise<void> {
    const transactions: TransactionModel[] = await this.transactionsService.findCollectionByParams({
      business_uuid: businessId,
      example: true,
    });

    for (const transaction of transactions) {
      await this.transactionsService.removeByUuid(transaction.uuid);
      await this.transactionEventProducer.produceTransactionRemoveEvent(transaction);
    }
  }

  public async refundExample(transaction: TransactionModel, refund: number): Promise<void> {
    await this.rabbitClient
      .send(
        {
          channel: RabbitRoutingKeys.TransactionsPaymentSubtract,
          exchange: 'async_events',
        },
        {
          name: RabbitRoutingKeys.TransactionsPaymentSubtract,
          payload: {
            amount: refund,
            business: {
              id: transaction.business_uuid,
            },
            channel_set: {
              id: transaction.channel_set_uuid,
            },
            date: transaction.updated_at,
            id: transaction.uuid,
            items: transaction.items,
          },
        },
      )
    ;
  }
}
