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
    return await this.transactionsService.create(this.stubService.createFakeTransaction(businessUuid));

    // return new Promise((resolve, reject) => {
      // (Array.apply(null, {length: count})).forEach(async () => {
        // try {
          // await this.transactionsService.create(this.stubService.createFakeTransaction(businessUuid));
        // } catch (e) {
          // return reject(e);
        // }
      // });
      // resolve(`${count} new fake transactions created`);
    // });
  }

  @Get('clean')
  @HttpCode(HttpStatus.OK)
  async removeTestTransactions(
  ) {
    return await this.transactionsService.deleteAll();
  }

}
