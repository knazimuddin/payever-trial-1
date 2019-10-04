import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessageBusService } from '@pe/nest-kit';
import { RabbitRoutingKeys } from '../../enums';
import { environment } from '../../environments';
import { ShippingOrderProcessedMessageDto } from '../dto';
import { TransactionsService } from '../services';
import { ShippingGoodsMailDtoConverter } from '../converter/mailer';
import { ShippingMailDto } from '../dto/mail';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { PaymentMailEventProducer } from '../producer';

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
}
