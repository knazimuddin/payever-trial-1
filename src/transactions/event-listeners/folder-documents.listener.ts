import { Injectable } from '@nestjs/common';
import { EventDispatcher, EventListener } from '@pe/nest-kit';
import { ElasticSearchClient } from '@pe/elastic-kit';
import {
  FoldersEventsEnum,
  FolderDocumentsResultsDto,
  ElasticSearchElementDto,
  ElasticAdditionalSearchResultsDto,
  FoldersElasticSearchService,
  ElasticFilterBodyInterface,
} from '@pe/folders-plugin';
import { ListQueryDto, TransactionFoldersIndexDto } from '../dto';
import { TransactionsService } from '../services';
import { ConfigService } from '@nestjs/config';
import { FoldersConfig } from '../../config';
import { ExchangeCalculator, ExchangeCalculatorFactory } from '../currency';
import { BusinessService } from '@pe/business-kit';
import { BusinessModel, TransactionModel } from '../models';
import { TransactionEventEnum } from '../enum/events';
import { TransactionTransformer } from '../transformers';

@Injectable()
export class FolderDocumentsListener {
  private readonly defaultCurrency: string;

  constructor(
    private readonly businessService: BusinessService,
    private readonly configService: ConfigService,
    private readonly elasticSearchClient: ElasticSearchClient,
    private readonly transactionsService: TransactionsService,
    private readonly exchangeCalculatorFactory: ExchangeCalculatorFactory,
    private readonly elasticSearchService: FoldersElasticSearchService,
    private readonly eventDispatcher: EventDispatcher,
  ) {
    this.defaultCurrency = this.configService.get<string>('DEFAULT_CURRENCY');
  }

  @EventListener(TransactionEventEnum.TransactionCreated)
  public async transactionCreated(
    transaction: TransactionModel,
  ): Promise<void> {

    const folderDocument: any = transaction.toObject();
    await this.eventDispatcher.dispatch(
      FoldersEventsEnum.FolderActionCreateDocument,
      folderDocument,
    );
  }

  @EventListener(TransactionEventEnum.TransactionUpdated)
  public async transactionUpdated(
    transaction: TransactionModel,
  ): Promise<void> {

    const folderDocument: any = transaction.toObject();
    await this.eventDispatcher.dispatch(
      FoldersEventsEnum.FolderActionUpdateDocument,
      folderDocument,
    );
  }

  @EventListener(TransactionEventEnum.TransactionDeleted)
  public async transactionDeleted(
    transactionId: string,
  ): Promise<void> {

    await this.eventDispatcher.dispatch(
      FoldersEventsEnum.FolderActionDeleteDocument,
      transactionId,
    );
  }

  @EventListener(FoldersEventsEnum.GetRootDocumentsIds)
  public async getFilteredRootDocumentIds(
    folderDocuments: FolderDocumentsResultsDto,
  ): Promise<void> {
    const filter: any = {
      $and: [
        { business_uuid: folderDocuments.businessId },
        { uuid: {
            $nin: folderDocuments.excludedDocumentIds,
          },
        },
      ],
    };

    const filteredDocuments: string[] = await this.transactionsService.findAllUuidByFilter(filter);

    folderDocuments.results.push(...filteredDocuments);
  }

  @EventListener(FoldersEventsEnum.ElasticBeforeGetResults)
  public async elasticBeforeGetResults(
    listDto: ListQueryDto,
    filter: ElasticFilterBodyInterface,
    businessId: string,
  ): Promise<void> {
    const business: BusinessModel = await this.businessService.findOneById(businessId) as unknown as BusinessModel;
    listDto.currency = business ? business.currency : this.defaultCurrency;
  }

  @EventListener(FoldersEventsEnum.ElasticBeforeIndexDocument)
  public async elasticBeforeIndexDocument(
    elasticSearchElementDto: ElasticSearchElementDto,
  ): Promise<void> {
    const transactionFoldersIndex: TransactionFoldersIndexDto =
      TransactionTransformer.transactionToFoldersIndex(elasticSearchElementDto.document);
    transactionFoldersIndex.amount = Math.trunc(transactionFoldersIndex.amount * 100);
    transactionFoldersIndex.amount_left = Math.trunc(transactionFoldersIndex.amount_left * 100);
    transactionFoldersIndex.total = Math.trunc(transactionFoldersIndex.total * 100);
    transactionFoldersIndex.total_left = Math.trunc(transactionFoldersIndex.total_left * 100);

    elasticSearchElementDto.document = transactionFoldersIndex;
  }

  @EventListener(FoldersEventsEnum.ElasticProcessSearchResult)
  public async elasticProcessSearchResult(
    elasticSearchElementDto: ElasticSearchElementDto,
  ): Promise<void> {
    elasticSearchElementDto.document.amount = elasticSearchElementDto.document.amount / 100;
    elasticSearchElementDto.document.amount_left = elasticSearchElementDto.document.amount_left / 100;
    elasticSearchElementDto.document.total = elasticSearchElementDto.document.total / 100;
    elasticSearchElementDto.document.total_left = elasticSearchElementDto.document.total_left / 100;
  }

  @EventListener(FoldersEventsEnum.ElasticGetAdditionalSearchResults)
  public async elasticGetAdditionalSearchResults(
    additionalResults: ElasticAdditionalSearchResultsDto,
  ): Promise<void> {
    const amount: number = await this.totalAmount(additionalResults.elasticFilters, additionalResults.currency);

    additionalResults.paginationData = {
      amount,
      amount_currency: additionalResults.currency,
    };

    const status: any[] =
      await this.elasticSearchService.distinctFieldValues('status', additionalResults.elasticFilters);
    const specific_status: any[] =
      await this.elasticSearchService.distinctFieldValues('specific_status', additionalResults.elasticFilters);

    additionalResults.usage = {
      specific_statuses: specific_status ?
        specific_status.map((bucket: { key: string }) => bucket.key.toUpperCase()) : [],
      statuses: status ? status.map((bucket: { key: string }) => bucket.key.toUpperCase()) : [],
    };
  }

  private async totalAmount(
    elasticFilters: any = { },
    currency: string = null,
  ): Promise<number> {
    return currency
      ? this.calculateAmountMultiCurrency(elasticFilters, currency)
      : this.calculateAmountSingleCurrency(elasticFilters)
      ;
  }

  private async calculateAmountSingleCurrency(filters: any = { }): Promise<number> {
    const body: any = {
      aggs : {
        total_amount: {
          sum: {
            field : 'total_left',
          },
        },
      },
      from: 0,
      query: {
        bool: filters,
      },
    };

    return this.elasticSearchClient.search(FoldersConfig.elastic.index.elasticIndex, body)
      .then((results: any) => {
        return results?.body?.aggregations?.total_amount?.value ?
          results.body.aggregations.total_amount.value / 100 :
          0;
      });
  }

  private async calculateAmountMultiCurrency(
    filters: any = { },
    currency: string,
  ): Promise<number> {
    const body: any = {
      aggs : {
        total_amount: {
          aggs: {
            total_amount: {
              sum: {
                field: 'total_left',
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
        .search(FoldersConfig.elastic.index.elasticIndex, body)
        .then((results: any) => {
          return results?.body?.aggregations?.total_amount?.buckets ?
            results.body.aggregations.total_amount.buckets :
            null;
        })
    ;
    let totalPerCurrency: number = 0;
    const calculator: ExchangeCalculator = this.exchangeCalculatorFactory.create();

    if (amounts) {
      for (const amount of amounts) {
        const currencyRate: number = await calculator.getCurrencyExchangeRate(amount.key);
        totalPerCurrency += currencyRate
          ? amount.total_amount.value / currencyRate
          : amount.total_amount.value
        ;
      }
    }
    const rate: number = await calculator.getCurrencyExchangeRate(currency);

    return rate
      ? Number(((totalPerCurrency * rate) / 100).toFixed(2))
      : Number((totalPerCurrency / 100).toFixed(2));
  }

}
