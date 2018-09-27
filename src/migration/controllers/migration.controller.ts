import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MigrationService } from '../services';
import { TransactionsService } from '../services';

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
    let mysqlData = await this.migrationService.find();
    // mysqlData = mysqlData.map((d) => d.payments_flow);
    console.log(mysqlData);
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
    // const testEntry = mysqlData.find((transaction) => {
      // return transaction.items.length > 0 && transaction.history.length > 0;
    // });

    // console.log(testEntry.business);

    mysqlData.forEach(entry => this.transactionsService.createOrUpdate(entry));

    return 'inserted';
  }

}
