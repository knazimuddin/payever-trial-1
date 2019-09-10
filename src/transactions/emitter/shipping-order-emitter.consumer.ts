import { InjectEventEmitter, NestEventEmitter, RabbitMqClient } from '@pe/nest-kit';
import { RabbitRoutingKeys } from '../../enums';
import { EventHandler } from '../decorators/event-handler.decorator';
import { ShippingGoodsDto } from '../dto/shipping';
import { PaymentActionsEnum } from '../enum';
import { PaymentActionEventsEnum } from '../enum/events';
import { HistoryEventActionCompletedInterface } from '../interfaces/history-event-message';
import { TransactionModel } from '../models';
import { AbstractConsumer } from './abstract.consumer';

export class ShippingOrderEmitterConsumer extends AbstractConsumer{
  constructor(
    @InjectEventEmitter() protected readonly emitter: NestEventEmitter,
    private readonly rabbitClient: RabbitMqClient,
  ) {
    super();
  }

  @EventHandler(PaymentActionEventsEnum.PaymentActionCompleted)
  private async handlePaymentCompleted(
    transaction: TransactionModel,
    actionEvent: HistoryEventActionCompletedInterface,
  ): Promise<void> {
    if (actionEvent.action === PaymentActionsEnum.ShippingGoods) {
      const shippingGoodsMessage: ShippingGoodsDto = {
        businessName: transaction.merchant_name,
        shipmentDate: new Date().toISOString().slice(0, 10),
        shippingOrderId: transaction.shipping_order_id,
        transactionDate: transaction.created_at,
        transactionId: transaction.uuid,
      };

      await this.rabbitClient.send(
        {
          channel: RabbitRoutingKeys.TransactionsActionShippingGoods,
          exchange: 'async_events',
        },
        {
          name: RabbitRoutingKeys.TransactionsActionShippingGoods,
          payload: shippingGoodsMessage,
        },
      );
    }
  }
}
