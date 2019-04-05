import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { existsSync, readFileSync } from 'fs';

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

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status of HTTP interface',
  })
  public async statusPost(
    @Body() body,
    @Req() request,
  ): Promise<{}> {
    return {
      status: 'ok',
      version: existsSync('./version') ? readFileSync('./version', 'utf8').trim() : 'unknown',
      body: body,
      headers: request.headers,
    };
  }
}
