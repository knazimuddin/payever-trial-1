import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessageBusService } from '@pe/nest-kit';
import { RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { ShippingLabelDownloadedDto, ShippingOrderProcessedMessageDto, ShippingSlipDownloadedDto } from '../dto';
import { TransactionHistoryService, TransactionsService } from '../services';
import { ShippingGoodsMailDtoConverter } from '../converter/mailer';
import { ShippingMailDto } from '../dto/mail';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { PaymentMailEventProducer } from '../producer';
import { TransactionModel } from '../models';
import { HistoryEventDataInterface } from '../interfaces/history-event-message';

@Controller()
export class ShippingBusMessagesController {
  private messageBusService: MessageBusService = new MessageBusService(
    {
      rsa: environment.rsa,
    },
    this.logger,
  );

  constructor(
    private readonly logger: Logger,
    private readonly transactionsService: TransactionsService,
    private readonly eventProducer: PaymentMailEventProducer,
    private readonly historyService: TransactionHistoryService,
  ) {}

  @MessagePattern({
    name: RabbitRoutingKeys.ShippingOrderProcessed,
    origin: 'rabbitmq',
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
    origin: 'rabbitmq',
  })
  public async onShippingLabelDownloaded(msg: any): Promise<void> {
    const labelDownloadedDto: ShippingLabelDownloadedDto
      = this.messageBusService.unwrapMessage<ShippingLabelDownloadedDto>(msg.data);
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
        shipping_order_id: labelDownloadedDto.shippingOrder.id,
    });

    if (!transaction) {
      this.logger.warn(`Transaction related with shipping order "${labelDownloadedDto.shippingOrder.id}" not found`);
      return ;
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
    origin: 'rabbitmq',
  })
  public async onShippingSlipDownloaded(msg: any): Promise<void> {
    const slipDownloadedDto: ShippingSlipDownloadedDto
      = this.messageBusService.unwrapMessage<ShippingSlipDownloadedDto>(msg.data);
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
      shipping_order_id: slipDownloadedDto.shippingOrder.id,
    });

    if (!transaction) {
      this.logger.warn(`Transaction related with shipping order "${slipDownloadedDto.shippingOrder.id}" not found`);
      return ;
    }

    await this.historyService.processHistoryRecord(
      transaction,
      'shipping-slip-downloaded',
      new Date(),
      {} as HistoryEventDataInterface,
    );
  }
}
