import { Injectable } from '@nestjs/common';
import { TransactionDoubleConverter } from '../converter';
import { ListQueryDto, PagingDto, PagingResultDto } from '../dto';
import { FiltersList } from '../elastic-filters/filters.list';
import { ElasticSearchClient } from '../elasticsearch/elastic-search.client';
import { ElasticTransactionEnum } from '../enum';
import { TransactionBasicInterface } from '../interfaces/transaction';
import { CurrencyExchangeService } from './currency-exchange.service';

@Injectable()
export class ElasticSearchService {

  constructor(
    private readonly currencyExchangeService: CurrencyExchangeService,
    private readonly elasticSearchClient: ElasticSearchClient,
  ) {}

  public async getResult(listDto: ListQueryDto): Promise<PagingResultDto> {
    const elasticFilters: any = this.createFiltersBody();
    if (listDto.filters) {
      this.addFilters(elasticFilters, listDto.filters);
    }
    if (listDto.search) {
      this.addSearchFilters(elasticFilters, listDto.search);
    }

    return Promise
      .all([
        this.search(elasticFilters, listDto.sorting, listDto.paging),
        this.totalAmount(elasticFilters, listDto.currency),
        this.distinctFieldValues('status', elasticFilters),
        this.distinctFieldValues('specific_status', elasticFilters),
      ])
      .then((res: any) => {
        return {
          collection: res[0].collection,
          filters: {},
          pagination_data: {
            amount: res[1],
            amount_currency: listDto.currency,
            page: listDto.page,
            total: res[0].total,
          },
          usage: {
            specific_statuses: res[3].map((bucket: { key: string }) => bucket.key.toUpperCase()),
            statuses: res[2].map((bucket: { key: string }) => bucket.key.toUpperCase()),
          },
        };
      })
    ;
  }

  private async search(
    filters: any,
    sorting: { [key: string]: string },
    paging: PagingDto,
  ): Promise<{ collection: TransactionBasicInterface[], total: number }> {
    const body: any = {
      from: paging.limit * (paging.page - 1),
      query: {
        bool: filters,
      },
      size: paging.limit,
      sort: [
        sorting,
      ],
    };

    return this.elasticSearchClient.search(ElasticTransactionEnum.index, body)
      .then((results: any) => {
        return {
          collection: results.hits.hits.map(
            (elem: any) => {
              elem._source._id = elem._source.mongoId;
              delete elem._source.mongoId;

              elem._source = TransactionDoubleConverter.unpack(elem._source);

              return elem._source;
            },
          ),
          total: results.hits.total,
        };
      });
  }

  private async totalAmount(
    elasticFilters: any = {},
    currency: string = null,
  ): Promise<number> {
    return currency
      ? this.calculateAmountMultiCurrency(elasticFilters, currency)
      : this.calculateAmountSingleCurrency(elasticFilters)
    ;
  }

  private async calculateAmountSingleCurrency(filters: any = {}): Promise<number> {
    const body: any = {
      aggs : {
        total_amount: {
          sum: {
            field : 'total',
          },
        },
      },
      from: 0,
      query: {
        bool: filters,
      },
    };

    return this.elasticSearchClient.search(ElasticTransactionEnum.index, body)
      .then((results: any) => {
        return results.aggregations.total_amount.value / 100;
      });
  }

  private async calculateAmountMultiCurrency(
    filters: any = {},
    currency: string,
  ): Promise<number> {
    const body: any = {
      aggs : {
        total_amount: {
          aggs: {
            total_amount: {
              sum: {
                field: 'total',
              },
            },
          },
          terms: {
            field : 'currency',
          },
        },
      },
      from: 0,
      query: {
        bool: filters,
      },
    };

    const amounts: Array<{ key: string, total_amount: { value: number }}> =
      await this.elasticSearchClient
        .search(ElasticTransactionEnum.index, body)
        .then((results: any) => results.aggregations.total_amount.buckets)
    ;
    let totalPerCurrency: number = 0;
    for (const transaction of amounts) {
      const currencyRate: number = await this.currencyExchangeService.getCurrencyExchangeRate(transaction.key);
      totalPerCurrency += currencyRate
        ? transaction.total_amount.value / currencyRate
        : transaction.total_amount.value
      ;
    }
    const rate: number = await this.currencyExchangeService.getCurrencyExchangeRate(currency);

    return rate
      ? Number(((totalPerCurrency * rate) / 100).toFixed(2))
      : Number((totalPerCurrency / 100).toFixed(2));
  }

  private async distinctFieldValues(
    field: string,
    filters: any = {},
  ): Promise<number> {
    const body: any = {
      aggs: {
        [field]: {
          terms: {
            field : field,
          },
        },
      },
      from: 0,
      query: {
        bool: filters,
      },
    };

    return this.elasticSearchClient.search(ElasticTransactionEnum.index, body)
      .then(
        (result: any) => result
          .aggregations[field]
          .buckets
        ,
      );
  }

  private createFiltersBody(): { must: any[], must_not: any[] } {
    return {
      must: [],
      must_not : [],
    };
  }

  private addSearchFilters(filters: any, search: string): void {
    const condition: { query_string: any } = {
      query_string: {
        fields: [
          'original_id^1',
          'customer_name^1',
          'merchant_name^1',
          'reference^1',
          'payment_details.finance_id^1',
          'payment_details.application_no^1',
          'customer_email^1',
        ],
        query: `*${search}*`,
      },
    };

    filters.must.push(condition);
  }

  private addFilters(elasticFilters: any, inputFilters: any): void {
    for (const key of Object.keys(inputFilters)) {
      this.addFilter(elasticFilters, key, inputFilters[key]);
    }
  }

  private addFilter(elasticFilters: any, field: string, filter: any): void {
    if (field === 'channel_set_uuid') {
      elasticFilters.must.push({
        match_phrase: {
          channel_set_uuid: filter.value[0],
        },
      });

      return;
    }

    if (filter && !filter.length) {
      filter = [filter];
    }

    for (const _filter of filter) {
      if (!_filter.value) {
        return;
      }
      if (!Array.isArray(_filter.value)) {
        _filter.value = [_filter.value];
      }
      for (const elasticFilter of FiltersList) {
        if (_filter.condition === elasticFilter.getName()) {
          elasticFilter.apply(elasticFilters, field, _filter);
          break;
        }
      }
    }
  }
}
