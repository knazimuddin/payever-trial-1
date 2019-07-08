import { Injectable } from '@nestjs/common';
import { DateStringHelper } from '../converter';
import { PagingResultDto, SortDto } from '../dto';
import { ElasticSearchClient } from '../elasticsearch/elastic-search.client';
import { ElasticTransactionEnum, FilterConditionEnum } from '../enum';
import { CurrencyExchangeService } from './currency-exchange.service';

@Injectable()
export class ElasticSearchService {

  constructor(
    private readonly currencyExchangeService: CurrencyExchangeService,
    private readonly elasticSearchClient: ElasticSearchClient,
  ) {}

  public async getResult(
    incomingFilters: any,
    sort: SortDto,
    search?: string,
    page?: number,
    limit?: number,
    currency?: string,
  ): Promise<PagingResultDto> {
    const elasticFilters: any = this.createFiltersBody();
    if (incomingFilters) {
      this.addFilters(elasticFilters, incomingFilters);
    }
    if (search) {
      this.addSearchFilters(elasticFilters, search);
    }
    const sorting = this.createSortingBody(sort);

    return Promise
      .all([
        this.search(elasticFilters, sorting, page, limit),
        this.totalAmount(elasticFilters, currency),
        this.distinctFieldValues('status', elasticFilters),
        this.distinctFieldValues('specific_status', elasticFilters),
      ])
      .then((res) => {
        return {
          collection: res[0].collection,
          pagination_data: {
            total: res[0].total,
            page: page,
            amount: res[1],
          },
          filters: {},
          usage: {
            statuses: res[2],
            specific_statuses: res[3],
          },
        };
      })
    ;
  }

  private async search(
    filters: any,
    sorting: { [key: string]: string },
    page?: number,
    limit?: number,
  ) {
    const body = {
      from: limit * (page - 1),
      size: limit,
      sort: [
        sorting,
      ],
      query: {
        bool: filters,
      },
    };

    return this.elasticSearchClient.search(ElasticTransactionEnum.index, body)
      .then((results: any) => {
        return {
          collection: results.hits.hits.map(
            elem => {
              elem._source._id = elem._source.mongoId;
              delete elem._source.mongoId;

              return elem._source;
            },
          ),
          total: results.hits.total,
        };
      });
  }

  private async totalAmount(
    elasticFilters = {},
    currency = null,
  ): Promise<number> {
    return currency
      ? this.calculateAmountMultiCurrency(elasticFilters, currency)
      : this.calculateAmountSingleCurrency(elasticFilters)
    ;
  }

  private async calculateAmountSingleCurrency(filters = {}): Promise<number> {
    const body = {
      from: 0,
      query: {
        bool: filters,
      },
      aggs : {
        total_amount: {
          sum: {
            field : 'total',
          },
        },
      },
    };

    return this.elasticSearchClient.search(ElasticTransactionEnum.index, body)
      .then((results: any) => {
        return results.aggregations.total_amount.value;
      });
  }

  private async calculateAmountMultiCurrency(
    filters = {},
    currency: string,
  ): Promise<number> {
    const body = {
      from: 0,
      query: {
        bool: filters,
      },
      aggs : {
        total_amount: {
          terms: {
            field : 'currency',
          },
          aggs: {
            total_amount: {
              sum: {
                field: 'total',
              },
            },
          },
        },
      },
    };

    const rates = await this.currencyExchangeService.getCurrencyExchanges();
    const amounts: Array<{ key: string, total_amount: { value: number }}> =
      await this.elasticSearchClient
        .search(ElasticTransactionEnum.index, body)
        .then((results: any) => results.aggregations.total_amount.buckets)
    ;
    const totalPerCurrency: number = amounts.reduce(
      (total, currentVal) => {
        const filteredRate = rates.find(x => x.code.toUpperCase() === currentVal.key.toUpperCase());
        const addition = filteredRate
          ? currentVal.total_amount.value / filteredRate.rate
          : currentVal.total_amount.value
        ;

        return total + addition;
      },
      0,
    );

    const rate = rates.find(x => x.code === currency);

    return totalPerCurrency * rate.rate;
  }

  private async distinctFieldValues(
    field,
    filters = {},
  ): Promise<number> {
    const body = {
      from: 0,
      query: {
        bool: filters,
      },
      aggs: {
        [field]: {
          terms: {
            field : field,
          },
        },
      },
    };

    return this.elasticSearchClient.search(ElasticTransactionEnum.index, body)
      .then((result: any) => result
        .aggregations[field]
        .buckets
        .map(bucket => bucket.key.toUpperCase()),
      );
  }

  private createFiltersBody() {
    return {
      must: [],
      filter: [],
      must_not : [],
    };
  }

  private createSortingBody(sort: SortDto): { [key: string]: string } {
    return {
      [sort.field]: sort.direction,
    };
  }

  private addSearchFilters(filters: any, search: string) {
    const condition = {
      query_string: {
        query: `*${search}*`,
        fields: [
          'original_id^1',
          'customer_name^1',
          'merchant_name^1',
          'reference^1',
          'payment_details.finance_id^1',
          'payment_details.application_no^1',
          'customer_email^1',
        ],
      },
    };

    filters.must.push(condition);
  }

  private addFilters(elasticFilters: any, inputFilters: any) {
    for (const key of Object.keys(inputFilters)) {
      this.addFilter(elasticFilters, key, inputFilters[key]);
    }
  }

  private addFilter(elasticFilters, field: string, filter: any) {
    if (field === 'channel_set_uuid') {
      const condition = {
        match: {
          channel_set_uuid: filter.value,
        },
      };

      elasticFilters.must.push(condition);

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
      let condition;
      let timeStamps;
      let from;
      let to;
      switch (_filter.condition) {
        case FilterConditionEnum.Is:
          for (const value of _filter.value) {
            condition = {
              match: {
                [field]: value,
              },
            };
            elasticFilters.must.push(condition);
          }

          break;
        case FilterConditionEnum.IsNot:
          for (const value of _filter.value) {
            condition = {
              match: {
                [field]: value,
              },
            };
            elasticFilters.must_not.push(condition);
          }
          break;
        case FilterConditionEnum.StartsWith:
          for (const value of _filter.value) {
            condition = {
              query_string: {
                query: `${value}*`,
                fields: [
                  `${field}^1`,
                ],
              },
            };
            elasticFilters.must.push(condition);
          }
          break;
        case FilterConditionEnum.EndsWith:
          for (const value of _filter.value) {
            condition = {
              query_string: {
                query: `*${value}`,
                fields: [
                  `${field}^1`,
                ],
              },
            };
            elasticFilters.must.push(condition);
          }
          break;
        case FilterConditionEnum.Contains:
          for (const value of _filter.value) {
            condition = {
              query_string: {
                query: `*${value}*`,
                fields: [
                  `${field}^1`,
                ],
              },
            };
            elasticFilters.must.push(condition);
          }
          break;
        case FilterConditionEnum.DoesNotContain:
          for (const value of _filter.value) {
            condition = {
              query_string: {
                query: `*${value}*`,
                fields: [
                  `${field}^1`,
                ],
              },
            };
            elasticFilters.must_not.push(condition);
          }
          break;
        case FilterConditionEnum.GreaterThan:
          for (const value of _filter.value) {
            condition = {
              range: {
                [field]: {
                  gt: value,
                },
              },
            };
            elasticFilters.must.push(condition);
          }
          break;
        case FilterConditionEnum.GreaterThanOrEqual:
          for (const value of _filter.value) {
            condition = {
              range: {
                [field]: {
                  gte: value,
                },
              },
            };
            elasticFilters.must.push(condition);
          }
          break;
        case FilterConditionEnum.LessThan:
          for (const value of _filter.value) {
            condition = {
              range: {
                [field]: {
                  lt: value,
                },
              },
            };
            elasticFilters.must.push(condition);
          }
          break;
        case FilterConditionEnum.LessThanOrEqual:
          for (const value of _filter.value) {
            condition = {
              range: {
                [field]: {
                  lte: value,
                },
              },
            };
            elasticFilters.must.push(condition);
          }
          break;
        case FilterConditionEnum.Between:
          from = _filter.value.map(elem => parseInt(elem.from, 10));
          to = _filter.value.map(elem => parseInt(elem.to, 10));

          condition = {
            range: {
              [field]: {
                gte: Math.max(...from),
                lte: Math.min(...to),
              },
            },
          };
          elasticFilters.must.push(condition);
          break;
        case FilterConditionEnum.IsDate:
          for (const value of _filter.value) {
            condition = {
              range: {
                [field]: {
                  gte: DateStringHelper.getDateStart(value),
                  lt: DateStringHelper.getTomorrowDateStart(value),
                },
              },
            };
            elasticFilters.must.push(condition);
          }
          break;
        case FilterConditionEnum.IsNotDate:
          for (const value of _filter.value) {
            condition = {
              range: {
                [field]: {
                  gte: DateStringHelper.getDateStart(value),
                  lt: DateStringHelper.getTomorrowDateStart(value),
                },
              },
            };
            elasticFilters.must_not.push(condition);
          }
          break;
        case FilterConditionEnum.AfterDate:
          timeStamps = _filter.value.map(elem => (new Date(DateStringHelper.getDateStart(elem))).getTime());
          condition = {
            range: {
              [field]: {
                gte: (new Date(Math.max(...timeStamps))).toISOString(),
              },
            },
          };
          elasticFilters.must.push(condition);
          break;
        case FilterConditionEnum.BeforeDate:
          timeStamps = _filter.value.map(elem => (new Date(DateStringHelper.getTomorrowDateStart(elem))).getTime());
          condition = {
            range: {
              [field]: {
                lt: (new Date(Math.min(...timeStamps))).toISOString(),
              },
            },
          };
          elasticFilters.must.push(condition);
          break;
        case FilterConditionEnum.BetweenDates:
          from = _filter.value.map(elem => (new Date(DateStringHelper.getDateStart(elem.from))).getTime());
          to = _filter.value.map(elem => (new Date(DateStringHelper.getTomorrowDateStart(elem.to))).getTime());

          condition = {
            range: {
              [field]: {
                gte: (new Date(Math.max(...from))).toISOString(),
                lt: (new Date(Math.min(...to))).toISOString(),
              },
            },
          };
          elasticFilters.must.push(condition);
          break;
      }
    }
  }
}
