import * as path from 'path';
import * as PdfMakePrinter from 'pdfmake/src/printer';
import * as XLSX from 'xlsx';
import { BusinessModel, TransactionModel } from '../models';
import { ExportFormatEnum } from '../enum';
import { BusinessFilter } from '../tools';
import { ExportedFileResultDto, ExportQueryDto, ExportTransactionsSettingsDto, PagingResultDto } from '../dto';
import { FoldersElasticSearchService, ElasticFilterBodyInterface, ElasticSearchCountResultsDto } from '@pe/folders-plugin';
import { BusinessService } from '@pe/business-kit';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpService, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments';
import * as FormData from 'form-data';
import * as moment from 'moment';
import { RabbitExchangesEnum, RabbitRoutingKeys } from '../../enums';
import { RabbitMqClient } from '@pe/nest-kit';

const shippingColumns: Array<{ title: string, name: string }> = [
  { title: 'Shipping City', name: 'city' },
  { title: 'Shipping Company', name: 'company' },
  { title: 'Shipping Country', name: 'country_name' },
  { title: 'Shipping Phone', name: 'phone' },
  { title: 'Shipping Street', name: 'street' },
  { title: 'Shipping Zip', name: 'zip_code' },
];

const productColumnsFunc: any = (key: number): Array<{ index: number, title: string, name: string }> => [
  { index: key, title: `Lineitem${key + 1} identifier`, name: 'uuid' },
  { index: key, title: `Lineitem${key + 1} name`, name: 'name' },
  { index: key, title: `Lineitem${key + 1} variant`, name: 'options' },
  { index: key, title: `Lineitem${key + 1} price`, name: 'price' },
  { index: key, title: `Lineitem${key + 1} vat`, name: 'vat_rate' },
  { index: key, title: `Lineitem${key + 1} sku`, name: 'sku' },
  { index: key, title: `Lineitem${key + 1} quantity`, name: 'quantity' },
];

@Injectable()
export class ExporterService {
  private readonly defaultCurrency: string;

  constructor(
    private readonly elasticSearchService: FoldersElasticSearchService,
    private readonly businessService: BusinessService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly logger: Logger,
    private readonly rabbitClient: RabbitMqClient,
  ) {
    this.defaultCurrency = this.configService.get<string>('DEFAULT_CURRENCY');
  }

  public async getTransactionsCount(
    exportDto: ExportQueryDto,
    businessId?: string,
  ): Promise<number> {
    const filter: ElasticFilterBodyInterface = this.elasticSearchService.createFiltersBody();
    filter.must.push({ term: { isFolder: false}});
    if (businessId) {
      filter.must.push({ match_phrase: { businessId: businessId}});
    }

    const result: ElasticSearchCountResultsDto = await this.elasticSearchService.count(filter);

    return result.count;
  }

  public async exportTransactionsViaLink(
    exportSettings: ExportTransactionsSettingsDto,
  ): Promise<void> {
    let exportedDocument: ExportedFileResultDto;
    if (exportSettings.businessId) {
      exportedDocument = await this.exportBusinessTransactions(
        exportSettings.exportDto,
        exportSettings.businessId,
        exportSettings.transactionsCount,
      );
    } else {
      exportedDocument = await this.exportAdminTransactions(
        exportSettings.exportDto,
        exportSettings.transactionsCount,
      );
    }

    const documentLink: string = await this.storeFileInMedia(exportedDocument);
    await this.sendEmailToDownloadFileByLink(documentLink);
  }

  public async exportBusinessTransactions(
    exportDto: ExportQueryDto,
    businessId: string,
    totalCount: number,
  ): Promise<ExportedFileResultDto> {
    exportDto.filters = BusinessFilter.apply(businessId, exportDto.filters);

    const business: BusinessModel = await this.businessService
      .findOneById(businessId) as unknown as BusinessModel;
    exportDto.currency = business ? business.currency : this.defaultCurrency;
    let businessName: string = `${exportDto.businessName.replace(/[^\x00-\x7F]/g, '')}`;
    businessName = businessName.replace(/\s/, '-');
    const fileName: string = `${businessName}-${moment().format('DD-MM-YYYY-HH-MM-SS')}.${exportDto.format}`;

    console.log(`${new Date()} : ${fileName}`);

    return {
      data: await this.exportToFile(exportDto, fileName, totalCount),
      fileName,
    };
  }

  public async exportAdminTransactions(
    exportDto: ExportQueryDto,
    totalCount: number,
  ): Promise<ExportedFileResultDto> {
    const fileName: string = `transactions-${moment().format('DD-MM-YYYY-HH-MM-SS')}.${exportDto.format}`;

    return {
      data: this.exportToFile(exportDto, fileName, totalCount),
      fileName,
    };
  }

  public sendRabbitEvent(
    exportDto: ExportQueryDto,
    transactionsCount: number,
    fileName?: string,
    businessId?: string,
  ): void {
    const exportTransactionsSettings: ExportTransactionsSettingsDto = {
      businessId,
      exportDto,
      fileName,
      transactionsCount,
    };

    this.rabbitClient.send(
      {
        channel: RabbitRoutingKeys.InternalTransactionExport,
        exchange: RabbitExchangesEnum.transactionsExport,
      },
      {
        name: RabbitRoutingKeys.InternalTransactionExport,
        payload: exportTransactionsSettings,
      },
    ).then();
  }

  private async exportToFile(
    exportDto: ExportQueryDto,
    fileName: string,
    totalCount: number,
  ): Promise<any> {
    console.log(`${new Date()} : start exportToFile`);

    let exportedCount: number = 0;
    const transactions: TransactionModel[] = [];
    let maxItemsCount: number = 0;
    while (exportedCount < totalCount) {
      console.log(`${new Date()} : exporting page ${exportDto.page}`);
      const result: PagingResultDto = await this.elasticSearchService.getResult(exportDto);
      for (const item of result.collection) {
        const transaction: TransactionModel = item as TransactionModel;
        transactions.push(transaction);
        maxItemsCount = transaction.items.length > maxItemsCount ? transaction.items.length : maxItemsCount;
      }
      exportedCount += result.collection.length;
      exportDto.page++;
    }

    console.log(`${new Date()} : got results+`);

    const columns: Array<{ title: string, name: string }> = JSON.parse(exportDto.columns);

    if (exportDto.format === ExportFormatEnum.pdf) {
      return this.exportPDF(transactions, columns, maxItemsCount);
    } else {
      return this.exportXLSX(transactions, fileName, columns, exportDto.format, maxItemsCount);
    }
  }

  private async exportXLSX(
    transactions: TransactionModel[],
    fileName: string,
    columns: Array<{ title: string, name: string }>,
    format: ExportFormatEnum = ExportFormatEnum.csv,
    maxItemsCount: number,
  ): Promise<any> {
    const bookType: XLSX.BookType = ExporterService.exportFormatToBookType(format);
    const productColumns: Array<{ index: number, title: string, name: string }> =
      ExporterService.getProductColumns(maxItemsCount);
    const header: string[] = [
      ...['CHANNEL', 'ID', 'TOTAL'],
      ...shippingColumns.map((c: { title: string, name: string }) => c.title),
      ...productColumns.map((c: { index: number, title: string, name: string }) => c.title),
      ...columns.map((c: { title: string, name: string }) => c.title)];
    const data: string[][] = ExporterService.getTransactionData(transactions, productColumns, columns);

    let wb: XLSX.WorkBook;
    let ws: XLSX.WorkSheet;

    console.log(`${new Date()} : create new sheet`);
    wb = XLSX.utils.book_new();
    ws = XLSX.utils.aoa_to_sheet([header]);
    let addedCount: number = 0;
    while (data.length > 0) {
      const recordsToAdd: string[][] = [];
      while ((data.length > 0) && (recordsToAdd.length < 1000)) {
        recordsToAdd.push(data.shift());
      }
      console.log(`${new Date()} : add 1K records to sheet, left: ${data.length}`);
      XLSX.utils.sheet_add_aoa(ws, [...recordsToAdd], { origin: -1});
      addedCount++;
      console.log(`${new Date()} : added 1K records to sheet ${addedCount * 1000}`);
    }

    XLSX.utils.book_append_sheet(wb, ws, `${fileName}`.slice(0, 30));

    console.log(`${new Date()} : before write`);

    return XLSX.write(wb, { bookType: bookType, bookSST: true, type: 'buffer' });
  }

  private async exportPDF(
    transactions: TransactionModel[],
    columns: Array<{ title: string, name: string }>,
    maxItemsCount: number,
  ): Promise<any> {
    const pageHeight: number = 5000;
    const productColumns: Array<{ index: number, title: string, name: string }> =
      ExporterService.getProductColumns(maxItemsCount);
    const header: any[] = [
      ...['CHANNEL', 'ID', 'TOTAL'],
      ...shippingColumns.map((c: { title: string, name: string }) => c.title ),
      ...productColumns.map((c: { index: number, title: string, name: string }) => c.title ),
      ...columns.map((c: { title: string, name: string }) => c.title )]
      .map((h: string) => ({ text: h, style: 'tableHeader'}));

    const data: any[][] = ExporterService.getTransactionData(transactions, productColumns, columns, true)
      .map((entity: any) => entity.map((e: string) => ({ text: e ? e.toString() : '',  fontSize: 9 })));

    const allColumns: any[] = [...shippingColumns, ...productColumns, ...columns];
    const cp: number = 100 / (allColumns.length + 2);
    const docDefinition: any = {
      content: [
        { text: 'Transactions', fontSize: 14, bold: true, margin: [0, 10, 0, 8] },
        {
          layout: {
            defaultBorder: false,
            fillColor: (rowIndex: number, _node: any, _columnIndex: number): string => {
              return (rowIndex % 2 === 0) ? '#f0f0f0' : '#ffffff';
            },
          },
          style: 'tableStyle',
          table: {
            body: [
              header,
              ...data,
            ],
            headerRows: 1,
            widths: [ `${cp / 2}%`, `${cp}%`, `${cp / 2}%`, ...allColumns.map(() => `${cp}%`)],
          },

        },
      ],
      pageMargins: [40, 40 , 40, 40],
      pageSize: {
        height: pageHeight,
        width: (allColumns.length + 2) * 120,
      },
      styles: {
        tableHeader: {
          bold: true,
          color: 'white',
          fillColor: '#242625',
          fontSize: 9,
        },
        tableStyle: {
          margin: [0, 0, 0, 0],
        },
      },
    };
    const fonts: any = {
      Roboto: {
        bold: path.resolve('./assets/fonts/Roboto-Medium.ttf'),
        bolditalics: path.resolve('./assets/fonts/Roboto-MediumItalic.ttf'),
        italics: path.resolve('./assets/fonts/Roboto-Italic.ttf'),
        normal: path.resolve('./assets/fonts/Roboto-Regular.ttf'),
      },
    };

    const printer: PdfMakePrinter = new PdfMakePrinter(fonts);

    return printer.createPdfKitDocument(
      docDefinition,
      {
        compress: true,
        pdfVersion: '1.7ext3',
      });
  }

  private static getProductColumns(maxItemsCount: number): any[] {
    let productColumns: any[] = [];

    for (let i: number = 0; i < maxItemsCount; i++) {
      productColumns = [...productColumns, ...productColumnsFunc(i)];
    }

    return productColumns;
  }

  private static getTransactionData(
    transactions: TransactionModel[],
    productColumns: Array<{ index: number, title: string, name: string }>,
    columns: Array<{ title: string, name: string }>,
    isFormatDate: boolean = false,
  ): any[] {
    return transactions
      .map((t: TransactionModel) => [
        ...[t.channel, t.original_id, t.total],
        ...shippingColumns
          .map((c: { title: string, name: string }) => {
            return t.shipping_address && c.name in t.shipping_address
              ? t.shipping_address[c.name]
              : t.billing_address[c.name] || '';
          }),
        ...productColumns
          .map((c: { index: number, title: string, name: string }) => {
            return c.index in t.items && c.name in t.items[c.index]
              ? this.getProductValue(c.name, t.items[c.index][c.name])
              : '';
          }),
        ...columns
          .map((c: { title: string, name: string }) =>
            isFormatDate && c.name === 'created_at'
                ? new Date(t[c.name]).toUTCString()
                : t[c.name],
          ),
      ]);
  }

  private static getProductValue(field: string, value: string | any[]): string {
    if (field !== 'options') {
      return value as string;
    }

    if (!value || !Array.isArray(value)) {
      return '';
    }

    return (value).map((item: { name: string, value: string }) => {
      return `${item.name}:${item.value}`;
    }).join(', ');
  }

  private static exportFormatToBookType(exportFormat: ExportFormatEnum): XLSX.BookType {
    switch (exportFormat) {
      case ExportFormatEnum.xlsx:
        return 'xlsx';
      case ExportFormatEnum.ods:
        return 'ods';
      default:
        return 'csv';
    }
  }

  private async storeFileInMedia(document: ExportedFileResultDto): Promise<string> {
    console.log(`${new Date()} : storeFileInMedia`);

    const url: string = `${environment.microUrlMedia}/api/storage/file`;
    const bodyFormData: FormData = new FormData();

    bodyFormData.append('file', document.data, { filename: document.fileName});
    const axiosRequestConfig: AxiosRequestConfig = {
      data: bodyFormData,
      headers: bodyFormData.getHeaders(),
      maxBodyLength: 524288000,
      method: 'POST',
      url: url,
    };

    let bodyLength: number;
    try {
      bodyLength = bodyFormData.getLengthSync();
    } catch (e) {
      bodyLength = 0;
    }

    this.logger.log({
      bodyFormDataSize: bodyLength,
      fileName: document.fileName,
      message: 'Sending file to media',
    });

    console.log(`${new Date()} : uploading`);
    const request: Observable<any> = await this.httpService.request(axiosRequestConfig);

    return request.pipe(
      map(( response: AxiosResponse<any>) => {
        this.logger.log({
          data: response.data,
          message: 'Received response from media call',
          url: url,
        });

        return response.data.url;
      }),
      catchError((error: AxiosError) => {
        const errorData: any = error.response?.data ? error.response.data : error.message;
        const errorStatus: number =
          error.response?.status ? error.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
        this.logger.error(
          {
            error: errorData,
            errorStatus: errorStatus,
            message: 'Failed response from media call',
            url: url,
        });

        throw new HttpException(errorData, errorStatus);
      }),
    )
      .toPromise();
  }


  private async sendEmailToDownloadFileByLink(documentLink: string): Promise<void> {
    this.logger.log(
      {
        document: documentLink,
        message: 'Send email with link to file',
      });
  }

}
