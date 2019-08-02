import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { BusinessCurrencyService } from '../services';
import { BusinessCurrencyDto, RemoveBusinessDto } from '../dto';
import { MessageBusService } from '@pe/nest-kit';
import { environment } from '../../environments';

@Controller()
export class BusinessBusMessagesController {
  private messageBusService: MessageBusService = new MessageBusService(
    {
      rsa: environment.rsa,
    },
    this.logger,
  );

  constructor(
    private readonly logger: Logger,
    private readonly businessCurrencyService: BusinessCurrencyService,
  ) { }

  @MessagePattern({
    name: '(users.event.business.export|users.event.business.(created|updated))',
    origin: 'rabbitmq',
  })
  public async onBusinessCreate(message: { data: {} }) {
    this.logger.log('received a business export event');

    const businessCurrencyDto: BusinessCurrencyDto = this.messageBusService.unwrapMessage<BusinessCurrencyDto>(message.data);

    await this.businessCurrencyService.save(businessCurrencyDto);
  }

  @MessagePattern({
    name: 'users.event.business.removed',
    origin: 'rabbitmq',
  })
  public async onBusinessRemovedEvent(msg: { data: {} }) {
    const data: RemoveBusinessDto = this.messageBusService.unwrapMessage<RemoveBusinessDto>(msg.data);

    await this.businessCurrencyService.deleteOneById(data._id);
  }
}
