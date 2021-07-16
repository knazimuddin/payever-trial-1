import { Injectable } from '@nestjs/common';
import { EventListener } from '@pe/nest-kit';
import { FoldersEventsEnum, FolderDocumentsResultsDto } from '@pe/folders-plugin';
import { BusinessFilter } from '../tools';
import { BusinessModel } from '../models';
import { ListQueryDto, PagingResultDto } from '../dto';
import { plainToClass } from 'class-transformer';
import { BusinessService, ElasticSearchService, TransactionsService } from '../services';
import { ConfigService } from '@nestjs/config';
import { FilterConditionEnum } from '@pe/common-sdk';

@Injectable()
export class GetFolderDocumentsListener {
  private readonly defaultCurrency: string;

  constructor(
    private readonly businessService: BusinessService,
    private readonly configService: ConfigService,
    private readonly elasticSearchService: ElasticSearchService,
    private readonly transactionsService: TransactionsService,
  ) {
    this.defaultCurrency = this.configService.get<string>('DEFAULT_CURRENCY');
  }

  @EventListener(FoldersEventsEnum.GetFolderDocuments)
  public async getFolderDocuments(
    folderDocuments: FolderDocumentsResultsDto,
  ): Promise<void> {
    let listDto: ListQueryDto = new ListQueryDto();
    if (folderDocuments.query && (Object.keys(folderDocuments.query).length > 0) ) {
      listDto = plainToClass<ListQueryDto, any>(ListQueryDto, folderDocuments.query);
    }
    await this.getResults(folderDocuments, listDto, FilterConditionEnum.isIn, folderDocuments.documentIds);
  }

  @EventListener(FoldersEventsEnum.GetRootDocuments)
  public async getRootDocuments(
    folderDocuments: FolderDocumentsResultsDto,
  ): Promise<void> {
    const listDto: ListQueryDto = plainToClass(ListQueryDto, folderDocuments.query);
    await this.getResults(folderDocuments, listDto, FilterConditionEnum.isNotIn, folderDocuments.excludedDocumentIds);
  }

  @EventListener(FoldersEventsEnum.GetFilteredRootDocumentIds)
  public async getFilteredRootDocumentIds(
    folderDocuments: FolderDocumentsResultsDto,
  ): Promise<void> {
    console.log('GetFilteredRootDocumentIds', folderDocuments);
    const filter: any = {
      $and: [
        folderDocuments.query,
        { uuid: {
          $nin: folderDocuments.excludedDocumentIds,
          },
        },
      ],
    };

    console.log(filter);
    const filteredDocuments: string[] = await this.transactionsService.findAllUuidByFilter(filter);
    console.log(filteredDocuments);

    folderDocuments.results.push(...filteredDocuments);
  }

  private async getResults(
    folderDocuments: FolderDocumentsResultsDto,
    listDto: ListQueryDto,
    condition: string,
    documentIds: string[],
  ): Promise<void> {

    if (documentIds.length) {
      const uuid: any = [
        {
          condition: condition,
          value: documentIds,
        },
      ];

      listDto.filters = {
        ...listDto.filters,
        uuid,
      };
    }

    listDto.filters = BusinessFilter.apply(folderDocuments.businessId, listDto.filters);
    const business: BusinessModel = await this.businessService.findBusinessById(folderDocuments.businessId);
    listDto.currency = business ? business.currency : this.defaultCurrency;
    const pagingResult: PagingResultDto = await this.elasticSearchService.getResult(listDto);

    folderDocuments.results.push(pagingResult);
  }

}
