import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitRoutingKeys } from '../../enums';
import { ShippingGoodsMailDtoConverter } from '../converter/mailer';
import { ShippingLabelDownloadedDto, ShippingOrderProcessedMessageDto, ShippingSlipDownloadedDto } from '../dto';
import { ShippingMailDto } from '../dto/mail';
import { HistoryEventDataInterface } from '../interfaces/history-event-message';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { PaymentMailEventProducer } from '../producer';
import { TransactionHistoryService, TransactionsService } from '../services';

@Controller()
export class ShippingBusMessagesController {
  constructor(
    private readonly logger: Logger,
    private readonly transactionsService: TransactionsService,
    private readonly eventProducer: PaymentMailEventProducer,
    private readonly historyService: TransactionHistoryService,
  ) {}

  @MessagePattern({
    name: RabbitRoutingKeys.ShippingOrderProcessed,
  })
  public async onShippingOrderProcessed(orderProcessedDto: ShippingOrderProcessedMessageDto): Promise<void> {
    const transaction: TransactionUnpackedDetailsInterface = await this.transactionsService.findUnpackedByUuid(
      orderProcessedDto.transactionId,
    );

    const mailDto: ShippingMailDto = ShippingGoodsMailDtoConverter.fromTransactionAndShippingOrder(
      transaction,
      orderProcessedDto,
    );

    await this.transactionsService.setShippingOrderProcessed(orderProcessedDto.transactionId);

    await this.eventProducer.produceShippingEvent(mailDto);
  }

  @MessagePattern({
    name: RabbitRoutingKeys.ShippingLabelDownloaded,
  })
  public async onShippingLabelDownloaded(labelDownloadedDto: ShippingLabelDownloadedDto): Promise<void> {
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
        shipping_order_id: labelDownloadedDto.shippingOrder.id,
    });

    if (!transaction) {
      this.logger.warn(`Transaction related with shipping order "${labelDownloadedDto.shippingOrder.id}" not found`);

      return;
    }

    await this.historyService.processHistoryRecord(
      transaction,
      'shipping-label-downloaded',
      new Date(),
      {} as HistoryEventDataInterface,
    );
  }

  @MessagePattern({
    name: RabbitRoutingKeys.ShippingSlipDownloaded,
  })
  public async onShippingSlipDownloaded(slipDownloadedDto: ShippingSlipDownloadedDto): Promise<void> {
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
      shipping_order_id: slipDownloadedDto.shippingOrder.id,
    });

    if (!transaction) {
      this.logger.warn(`Transaction related with shipping order "${slipDownloadedDto.shippingOrder.id}" not found`);

      return;
    }

    await this.historyService.processHistoryRecord(
      transaction,
      'shipping-slip-downloaded',
      new Date(),
      {} as HistoryEventDataInterface,
    );
  }
}
