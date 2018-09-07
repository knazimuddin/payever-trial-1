import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiUseTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsListService } from '../services';

@Controller('business/:businessId')
@ApiUseTags('business')
@ApiBearerAuth()
@ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.'})
@ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.'})
export class BusinessController {

  constructor(private readonly listService: TransactionsListService) {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
  // @ApiResponse({status: HttpStatus.OK, description: 'The records have been successfully fetched.', type: GetTodoDto, isArray: true})
  async getList(
    @Param('businessId') businessId: number,
    @Query('orderBy') orderBy: string,
    @Query('direction') direction: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('query') search: string,
    @Query('filters') filters: any = {},
  ): Promise<any> {
    try {
      console.log('filters', filters);

      filters.businessId = {
        condition: 'is',
        value: businessId,
      };

      return await this.listService.find(page, limit, filters, search, orderBy, direction);
    } catch (error) {
      throw error;
    }
  }

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  async getSettings(
    @Param('businessId') businessId: number,
  ): Promise<any> {
    console.log('here?');
    return {
      columns_to_show : [
        'customerName',
        'status',
        'merchantName',
        'type',
        'specificStatus',
        'customerEmail',
        // 'merchantEmail', we don't have access to it
        'total',
      ],
      direction: '',
      filters: null,
      id: null, // 9???
      limit: '',
      order_by: '',
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  // @ApiResponse({status: HttpStatus.OK, description: 'The records have been successfully fetched.', type: GetTodoDto, isArray: true})
  async getDetail(
    @Param('id') id: string,
  ): Promise<any> {
    try {
      return await this.listService.findOne(id);
    } catch (error) {
      throw error;
    }
  }


}
