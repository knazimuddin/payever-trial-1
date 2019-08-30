import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessageBusService } from '@pe/nest-kit';
import { environment } from '../../environments';
import { BusinessDto, RemoveBusinessDto } from '../dto';
import { BusinessService, TransactionsExampleService } from '../services';

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
    private readonly exampleService: TransactionsExampleService,
  ) {}

  @MessagePattern({
    name: 'users.event.business.created',
    origin: 'rabbitmq',
  })
  public async onBusinessCreate(message: { data: {} }): Promise<void> {
    this.logger.log({
      context: 'BusinessBusMessagesController',
      data: message,
      message: 'received a business created event',
    });

    const businessDto: BusinessDto = this.messageBusService
      .unwrapMessage<BusinessDto>(message.data);

    await this.businessService.save(businessDto);
    await this.exampleService.createBusinessExamples(businessDto);
  }

  @MessagePattern({
    name: '(users.event.business.(updated|export))',
    origin: 'rabbitmq',
  })
  public async onBusinessUpdate(message: { data: {} }): Promise<void> {
    this.logger.log({
      context: 'BusinessBusMessagesController',
      data: message,
      message: 'received a business (updated|export) event',
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
    const businessDto: RemoveBusinessDto = this.messageBusService.unwrapMessage<RemoveBusinessDto>(message.data);

    await this.businessService.deleteOneById(businessDto._id);
    await this.exampleService.removeBusinessExamples(businessDto._id);
  }
}
