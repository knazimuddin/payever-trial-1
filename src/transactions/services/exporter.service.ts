import * as path from 'path';
import * as PdfMakePrinter from 'pdfmake/src/printer';
import * as XLSX from 'xlsx';
import { BusinessModel, TransactionModel } from '../models';
import { ExportFormatEnum } from '../enum';
import { BusinessFilter } from '../tools';
import { ExportedFileResultDto, ExportQueryDto, PagingResultDto } from '../dto';
import { FoldersElasticSearchService } from '@pe/folders-plugin';
import { BusinessService } from '@pe/business-kit';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

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
  ) {
    this.defaultCurrency = this.configService.get<string>('DEFAULT_CURRENCY');
  }

  public async exportBusinessTransactions(
    exportDto: ExportQueryDto,
    businessId: string,
  ): Promise<ExportedFileResultDto> {
    exportDto.filters = BusinessFilter.apply(businessId, exportDto.filters);
    const business: BusinessModel = await this.businessService
      .findOneById(businessId) as unknown as BusinessModel;
    exportDto.currency = business ? business.currency : this.defaultCurrency;
    const fileName: string = `"${exportDto.businessName.replace(/[^\x00-\x7F]/g, '')}"`;

    return {
      data: await this.exportToFile(exportDto, fileName),
      fileName,
    };
  }

  public async exportAdminTransactions(
    exportDto: ExportQueryDto,
  ): Promise<ExportedFileResultDto> {
    const fileName: string = 'export';

    return {
      data: this.exportToFile(exportDto, fileName),
      fileName,
    };
  }


  private async exportToFile(
    exportDto: ExportQueryDto,
    fileName: string,
  ): Promise<any> {
    exportDto.page = 1;
    const result: PagingResultDto =  await this.elasticSearchService.getResult(exportDto);
    const columns: Array<{ title: string, name: string }> = JSON.parse(exportDto.columns);
    const transactions: TransactionModel[] =  result.collection as TransactionModel[];

    if (exportDto.format === ExportFormatEnum.pdf) {
      return this.exportPDF(transactions, columns);
    } else {
      return this.exportXLSX(transactions, fileName, columns, exportDto.format);
    }
  }

  private async exportXLSX(
    transactions: TransactionModel[],
    fileName: string,
    columns: Array<{ title: string, name: string }>,
    format: ExportFormatEnum = ExportFormatEnum.csv,
  ): Promise<any> {
    const bookType: XLSX.BookType = ExporterService.exportFormatToBookType(format);
    const productColumns: Array<{ index: number, title: string, name: string }> =
      ExporterService.getProductColumns(transactions);
    const header: string[] = [
      ...['CHANNEL', 'ID', 'TOTAL'],
      ...shippingColumns.map((c: { title: string, name: string }) => c.title ),
      ...productColumns.map((c: { index: number, title: string, name: string }) => c.title ),
      ...columns.map((c: { title: string, name: string }) => c.title )];
    const data: string[][] = ExporterService.getTransactionData(transactions, productColumns, columns);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    XLSX.utils.book_append_sheet(wb, ws, `${fileName}`.slice(0, 30));

    return XLSX.write(wb, { bookType: bookType, bookSST: true, type: 'buffer' });
  }

  private async exportPDF(
    transactions: TransactionModel[],
    columns: Array<{ title: string, name: string }>,
  ): Promise<void> {
    const pageHeight: number = 5000;
    const productColumns: Array<{ index: number, title: string, name: string }> =
      ExporterService.getProductColumns(transactions);
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
        pdfVersion: '1.7ext3',
      });
  }

  private static getProductColumns(transactions: TransactionModel[]): any[] {
    let productColumns: any[] = [];
    const maxItems: number = Math.max.apply(
      Math,
      transactions.map((t: TransactionModel) => t.items ? t.items.length : 0),
    );
    for (let i: number = 0; i < maxItems; i++) {
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
}
