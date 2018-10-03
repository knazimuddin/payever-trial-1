import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { TransactionsService, StubService } from '../services';

@Controller('dev')
export class DevController {

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly stubService: StubService,
  ) {}

  @Get('create/:businessUuid/:count')
  @HttpCode(HttpStatus.OK)
  async createTestTransactions(
    @Param('businessUuid') businessUuid: string,
    @Param('count') count: number,
  ) {
    (Array.apply(null, {length: count})).forEach(async () => {
      await this.transactionsService.create(this.stubService.createFakeTransaction(businessUuid));
    });

    return `${count} new fake transactions created`;
  }

  @Get('clean')
  @HttpCode(HttpStatus.OK)
  async removeTestTransactions(
  ) {
    return await this.transactionsService.deleteAll();
  }

}
