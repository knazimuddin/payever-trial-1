import { Controller, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { MessagePattern } from '@nestjs/microservices';
import { RabbitChannels, RabbitRoutingKeys } from '../../enums';
import { ExportTransactionsSettingsDto } from '../dto';
import { ExporterService } from '../services';

@Controller()
export class ExportTransactionsBusMessagesController {
  constructor(
    private readonly exporterService: ExporterService,
    private readonly logger: Logger,
  ) { }

  @MessagePattern({
    channel: RabbitChannels.TransactionsExport,
    name: RabbitRoutingKeys.InternalTransactionExport,
  })
  public async onExportTransactionEvent(data: any): Promise<void> {
    this.logger.log({
      data: data,
      text: 'Received export transactions event',
    });

    const settings: ExportTransactionsSettingsDto = plainToClass(ExportTransactionsSettingsDto, data);

    if (settings.exportDto.limit > 10000) {
      this.logger.warn({
        settings: data,
        text: 'Limit more than 10000',
      });

      settings.exportDto.limit = 10000;
    }

    await this.exporterService.exportTransactionsToLink(settings.exportDto, settings.businessId);
  }

}

