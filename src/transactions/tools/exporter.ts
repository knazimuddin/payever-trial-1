import { FastifyReply } from 'fastify';
import * as moment from 'moment';
import * as path from 'path';
import * as PdfMakePrinter from 'pdfmake/src/printer';
import * as XLSX from 'xlsx';
import { TransactionModel } from '../models';

export type ExportFormat = 'xlsx' | 'xls' | 'csv' | 'ods' | 'pdf';

const shippingsColumns: Array<{ title: string, name: string }> = [
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
  { index: key, title: `Lineitem${key + 1} price`, name: 'price' },
  { index: key, title: `Lineitem${key + 1} vat`, name: 'vat_rate' },
  { index: key, title: `Lineitem${key + 1} quantity`, name: 'quantity' },
];

export class Exporter {
  public static export(
    transactions: TransactionModel[],
    res: FastifyReply<any>,
    fileName: string,
    columns: Array<{ title: string, name: string }>,
    format: ExportFormat = 'csv',
  ): void {
    if (format === 'pdf') {
      return this.exportPDF(transactions, res, fileName, columns);
    }

    const productColumns: Array<{ index: number, title: string, name: string }> = this.getProductColumns(transactions);
    
    const header: string[] = [
      ...['CHANNEL', 'ID', 'TOTAL'],
      ...shippingsColumns.map((c: { title: string, name: string }) => c.title ),
      ...productColumns.map((c: { index: number, title: string, name: string }) => c.title ),
      ...columns.map((c: { title: string, name: string }) => c.title )];
    const data: string[][] = transactions
      .map((t: TransactionModel) => [
        ...[t.channel, t.original_id, t.total],
        ...shippingsColumns
          .map((c: { title: string, name: string }) => {
            return t.shipping_address && t.shipping_address[c.name] ? t.shipping_address[c.name] : ''; 
          }),
        ...productColumns
          .map((c: { index: number, title: string, name: string }) => {
            t.items[c.index] && t.items[c.index][c.name] ? t.items[c.index][c.name] : '';
          }),
        ...columns
          .map((c: { title: string, name: string }) => t[c.name] ),
      ]);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    XLSX.utils.book_append_sheet(wb, ws, `${fileName}`.slice(0, 30));
    const file: any = XLSX.write(wb, { bookType: format, bookSST: true, type: 'buffer' });
    res.header('Content-Transfer-Encoding', `binary`);
    res.header('Access-Control-Expose-Headers', `Content-Disposition,X-Suggested-Filename`);
    res.header('Content-disposition', `attachment;filename=${fileName}-${moment().format('DD-MM-YYYY')}.${format}`);
    res.send(file);
  }

  public static exportPDF(
    transactions: TransactionModel[],
    res: FastifyReply<any>,
    fileName: string,
    columns: Array<{ title: string, name: string }>,
  ): void {
    const productColumns: Array<{ index: number, title: string, name: string }> = this.getProductColumns(transactions);
    const header: any[] = [
      ...['CHANNEL', 'ID', 'TOTAL'],
      ...shippingsColumns.map((c: { title: string, name: string }) => c.title ),
      ...productColumns.map((c: { index: number, title: string, name: string }) => c.title ),
      ...columns.map((c: { title: string, name: string }) => c.title )]
      .map((h: string) => ({ text: h, style: 'tableHeader'}));
      
    const data: any[][] = transactions
      .map((t: TransactionModel) => [
        ...[t.channel, t.original_id, t.total]
          .map((e: string) => ({ text: e ? e.toString() : '',  fontSize: 9 })),
        ...shippingsColumns
          .map((c: { title: string, name: string }) => {
            return t.shipping_address && t.shipping_address[c.name] ? t.shipping_address[c.name] : ''; 
          }),
        ...productColumns
          .map((c: { index: number, title: string, name: string }) => {
            t.items[c.index] && t.items[c.index][c.name] ? t.items[c.index][c.name] : '';
          }),
        ...columns
          .map((c: { title: string, name: string }) => t[c.name] ),
        ...columns
          .map((c: { title: string, name: string }) =>
            c.name === 'created_at'
              ? new Date(t[c.name]).toUTCString()
              : t[c.name],
          )
          .map((e: string) => ({ text: e ? e.toString() : '',  fontSize: 9 })),
      ]);
    const cp: number = 100 / (columns.length + 2);
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
            widths: [ `${cp / 2}%`, `${cp}%`, `${cp / 2}%`, ...columns.map(() => `${cp}%`)],
          },

        },
      ],
      pageMargins: [40, 40 , 40, 40],
      pageSize: {
        height: 'auto',
        width: (columns.length + 2) * 120,
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
    const doc: any = printer.createPdfKitDocument(docDefinition);
    const chunks: any[] = [];
    doc.on('data', (chunk: any) => chunks.push(chunk));
    doc.on('end', () => {
      res.header('Content-Transfer-Encoding', `binary`);
      res.header('Access-Control-Expose-Headers', `Content-Disposition,X-Suggested-Filename`);
      res.header('Content-disposition', `attachment;filename=${fileName}-${moment().format('DD-MM-YYYY')}.pdf`);
      res.send(   Buffer.concat(chunks));
    });
    doc.end();
  }

  private static getProductColumns(
    transactions: TransactionModel[],
  ): Array<{ index: number, title: string, name: string }> {
    const productColumns: any[] = [];
    const maxItems: number = Math.max.apply(
      Math, 
      transactions.map((t: TransactionModel) => t.items ? t.items.length : 0),
    );
    for (let i: number = 0; i < maxItems; i++) {
      productColumns.push(productColumnsFunc(i));
    }

    return productColumns;
  }
}
