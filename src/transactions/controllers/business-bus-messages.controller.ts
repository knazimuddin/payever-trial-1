import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessageBusService } from '@pe/nest-kit';
import { environment } from '../../environments';
import { BusinessDto, RemoveBusinessDto } from '../dto';
import { BusinessService } from '../services';

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
    private readonly businessService: BusinessService,
  ) {}

  @MessagePattern({
    name: '(users.event.business.(created|updated|export))',
    origin: 'rabbitmq',
  })
  public async onBusinessCreate(message: { data: {} }): Promise<void> {
    this.logger.log({
      context: 'BusinessBusMessagesController',
      data: message,
      message: 'received a business (created|updated|export) event',
    });

    const businessDto: BusinessDto = this.messageBusService
      .unwrapMessage<BusinessDto>(message.data);

    await this.businessService.save(businessDto);
  }

  @MessagePattern({
    name: 'users.event.business.removed',
    origin: 'rabbitmq',
  })
  public async onBusinessRemovedEvent(message: { data: {} }): Promise<void> {
    this.logger.log({
      context: 'BusinessBusMessagesController',
      data: message,
      message: 'received a business remove event',
    });
    const dto: RemoveBusinessDto = this.messageBusService.unwrapMessage<RemoveBusinessDto>(message.data);

    await this.businessService.deleteOneById(dto._id);
  }
}
