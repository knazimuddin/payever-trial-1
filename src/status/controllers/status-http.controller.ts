import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { readFileSync, existsSync } from "fs";

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
      version: existsSync('./version') ? readFileSync('./version', 'utf8').trim() : 'unknown',
    };
  }
}
