import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

@Controller('status')
export class StatusHttpController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status of HTTP interface',
  })
  public async status(): Promise<{}> {
    return {
      status: 'ok',
    };
  }
}
