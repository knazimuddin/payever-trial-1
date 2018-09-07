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
    @Param('businessUuid') businessUuid: number,
    @Query('orderBy') orderBy: string = 'created_at',
    @Query('direction') direction: string = 'asc',
    @Query('limit') limit: number = 3,
    @Query('page') page: number = 1,
    @Query('query') search: string,
    @Query('filters') filters: any = {},
  ): Promise<any> {
    try {
      // filters.business_uuid = {
        // condition: 'is',
        // value: businessUuid,
      // };

      const filtersWithBusiness = {
        // ...filters
        business_uuid: businessUuid,
      };

      const sort = {};
      sort[orderBy] = direction.toLowerCase();

      return Promise.all([
        this.transactionsService.findMany(+page, +limit, sort, filtersWithBusiness, search),
        this.transactionsService.count(filtersWithBusiness, search),
        this.transactionsService.total(filtersWithBusiness, search),
      ])
        .then((res) => {
          console.log(res);
          return {
            collection: res[0],
            pagination_data: {
              totalCount: res[1],
              total: res[2],
              current: page,
            },
            filters: {},
            usage: this.getUsage(),
          };
        });

    } catch (error) {
      throw error;
    }
  }

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  async getSettings(
    @Param('businessUuid') businessUuid: number,
  ): Promise<any> {
    return {
      columns_to_show : [
        'customerName',
        'status',
        'merchantName',
        'type',
        'specificStatus',
        'customerEmail',
        'merchantEmail',
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
  // @ApiResponse({status: HttpStatus.OK, description: 'The records have been successfully fetched.', type: GetTodoDto})
  async getDetail(
    @Param('id') id: string,
  ): Promise<any> {
    try {
      // return await this.listService.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  private getUsage() {
    return {
      statuses: Object.keys(this.getStatusTranslations()).map((key) => ({key, name: this.getStatusTranslations()[key]})),
    };
  }

  private getStatusTranslations() {
    return {
      STATUS_CANCELLED: 'Cancelled',
      STATUS_FAILED: 'Failed',
      STATUS_DECLINED: 'Declined',
      STATUS_IN_PROCESS: 'In progress',
      STATUS_PAID: 'Paid',
      STATUS_REFUNDED: 'Refunded',
      STATUS_ACCEPTED: 'Accepted',
      STATUS_NEW: 'New',
    };
  }

}
