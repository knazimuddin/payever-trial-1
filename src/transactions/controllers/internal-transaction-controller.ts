import { Controller, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitRoutingKeys, RabbitChannels } from '../../enums';
import { TransactionModel } from '../models';
import { TransactionSchemaName } from '../schemas';
import { TransactionEventProducer } from '../producer';
import { PaymentStatusesEnum, PaymentActionsEnum } from '../enum';
import { TransactionPaymentDto } from '../dto/checkout-rabbit/';

@Controller()
export class InternalTransactionEventsController {
  constructor(
    @InjectModel(TransactionSchemaName) private readonly transactionsModel: Model<TransactionModel>,
    private readonly transactionsEventProducer: TransactionEventProducer,
    private readonly logger: Logger,
  ) { }

  @MessagePattern({
    channel: RabbitChannels.Transactions,
    name: RabbitRoutingKeys.InternalTransactionPaymentRefund,
  })
  public async onInternalTransactionRefundEvent(payload: TransactionPaymentDto): Promise<void> {
    this.logger.log({ text: 'INTERNAL.TRANSACTION.REFUND', payload });

    try {
      const transaction: TransactionModel = await this.transactionsModel.findOne({ uuid: payload.id}).lean();

      if (!transaction) {
        throw new NotFoundException(`Transaction with id ${payload.id} not found`);
      }

      const verifiedAction: PaymentActionsEnum = transaction.status === PaymentStatusesEnum.Refunded ?
        PaymentActionsEnum.Refund : PaymentActionsEnum.Cancel;

      if (!transaction.history || transaction.history.length === 0) {
        this.logger.log({
          text: 'INTERNAL.TRANSACTION.REFUND: transaction.history is empty',
          transaction_uuid: transaction.uuid,
        });
        throw new NotFoundException(`Transaction history with id ${payload.id} haven't added yet`);
      } else {
        let refundedAmount: number = 0.0;
        for (const item of transaction.history) {
          if (item.action === verifiedAction && item.amount) {
            refundedAmount = Number(refundedAmount) + Number(item.amount);
          }
        }
        if (refundedAmount === 0) {
          this.logger.log({
            text: 'INTERNAL.TRANSACTION.REFUND: refundedAmount = 0', transaction_uuid: transaction.uuid,
          });
          throw new NotFoundException(`Transaction history with id ${payload.id} haven't added yet completely`);
        }

        await this.transactionsEventProducer.produceTransactionRefundEventPayload(payload);

        this.logger.log({
          text: 'INTERNAL.TRANSACTION.REFUND: Send updated transaction',
          transaction_uuid: transaction.uuid,
        });
      }
    } catch (e) {
      this.logger.error( {
        payload: payload,
        text: 'ERROR IN INTERNAL.TRANSACTION.REFUND: ' + e.text,
      });
    }
  }
}
