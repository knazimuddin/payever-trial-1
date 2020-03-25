import { Body, Controller, Post } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { RabbitMqClient } from '@pe/nest-kit';

@Controller('debug')
@ApiUseTags('business inventory')
export class DebugController {
  constructor(
    private readonly rabbitMqClient: RabbitMqClient,
  ) {}

  @Post('event')
  public async event(
    @Body() body: any,
  ): Promise<void> {
    await this.rabbitMqClient
      .send(
        {
          channel: body.name,
          exchange: 'async_events',
        },
        body,
      );

    return body;
  }
}
