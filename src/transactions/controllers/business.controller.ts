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
import { TransactionsService } from '../services';
import { snakeCase } from 'lodash';

@Controller('business/:businessUuid')
@ApiUseTags('business')
@ApiBearerAuth()
@ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'Invalid authorization token.'})
@ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.'})
export class BusinessController {

  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
  // @ApiResponse({status: HttpStatus.OK, description: 'The records have been successfully fetched.', type: GetTodoDto, isArray: true})
  async getList(
    @Param('businessUuid') businessUuid: string,
    @Query('orderBy') orderBy: string = 'created_at',
    @Query('direction') direction: string = 'asc',
    @Query('limit') limit: number = 3,
    @Query('page') page: number = 1,
    @Query('query') search: string,
    @Query('filters') filters: any = {},
  ): Promise<any> {
    try {

      console.log('page:', page);
      console.log('limit:', limit);
      console.log('orderBy:', orderBy);
      console.log('direction:', direction);
      console.log('filters:', filters);
      console.log('search:', search);

      filters.business_uuid = {
        condition: 'is',
        value: businessUuid,
      };

      // console.log('input filters', filters);


      // const filtersWithBusiness = {
        // ...filters
        // business_uuid: businessUuid,
      // };

      console.log();
      const sort = {};
      sort[snakeCase(orderBy)] = direction.toLowerCase();

      return Promise.all([
        this.transactionsService.findMany(filters, sort, search, +page, +limit),
        this.transactionsService.count(filters, search),
        this.transactionsService.total(filters, search),
      ])
        .then((res) => {
          return {
            collection: res[0],
            pagination_data: {
              totalCount: res[1],
              total: res[2],
              current: page,
            },
            filters: {},
            usage: {},
          };
        });

    } catch (error) {
      throw error;
    }
  }

  @Get('detail/:uuid')
  @HttpCode(HttpStatus.OK)
  // @ApiResponse({status: HttpStatus.OK, description: 'The records have been successfully fetched.', type: GetTodoDto})
  async getDetail(
    @Param('uuid') uuid: string,
  ): Promise<any> {
    try {
      return await this.transactionsService.findOne(uuid);
    } catch (error) {
      throw error;
    }
  }

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  async getSettings(
    @Param('businessUuid') businessUuid: string,
  ): Promise<any> {
    return {
      columns_to_show : [
        'created_at',
        'customer_email',
        'customer_name',
        'merchant_email',
        'merchant_name',
        'specific_status',
        'status',
        'type',
      ],
      direction: '',
      filters: null,
      id: null, // 9???
      limit: '',
      order_by: '',
    };
  }

}
