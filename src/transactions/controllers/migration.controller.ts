import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MigrationService, TransactionsService } from '../services';

@Controller('migration')
export class MigrationController {

  constructor(
    private readonly migrationService: MigrationService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get('fetch')
  @HttpCode(HttpStatus.OK)
  async fetch(
  ) {
    const mysqlData = await this.migrationService.find();
    return 'fetched';
  }

  @Get('insert')
  @HttpCode(HttpStatus.OK)
  async insert(
  ) {
    // const mysqlData = await this.migrationService.find();
    // console.log(mysqlData);
    return 'inserted';
  }

  @Get('migrate')
  @HttpCode(HttpStatus.OK)
  async migrate(
  ) {
    const mysqlData = await this.migrationService.find();
    const entry = mysqlData.find((transaction) => {
      return transaction.items.length > 0 && transaction.history.length > 0;
    });
    console.log('entry.uuid', entry.uuid);
    console.log('entry.business_uuid', entry.business_uuid);
    console.log('entry.history', entry.history);

    // this.transactionsService.createOrUpdate(entry);

    return 'inserted';
  }

}
