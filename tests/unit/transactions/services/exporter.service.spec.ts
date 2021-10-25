// tslint:disable:object-literal-sort-keys
// tslint:disable:no-big-function
import 'mocha';
import * as sinon from 'sinon';
import { chaiExpect } from '../../../bootstrap';
import { HttpService, Logger } from '@nestjs/common';
import { TransactionModel } from '../../../../src/transactions/models';
import { ExportedFileResultDto, ExportQueryDto } from '../../../../src/transactions/dto';
import { ExportFormatEnum } from '../../../../src/transactions/enum';
import { FastifyReply } from 'fastify';
import * as PdfMakePrinter from 'pdfmake/src/printer';
import { EventEmitter } from 'events';
import { FoldersElasticSearchService } from '@pe/folders-plugin';
import { BusinessService } from '@pe/business-kit';
import { ConfigService } from '@nestjs/config';
import { RabbitMqClient } from '@pe/nest-kit';
import { ExporterService } from '../../../../src/transactions/services';
import { PagingResultDto } from '@pe/folders-plugin/module/dto';

const expect: Chai.ExpectStatic = chaiExpect;

const businessId: string = 'd82bd863-26e5-4182-9a6b-f1dcc8507cb1';
const transaction: TransactionModel = {
  id: '4416ed60-93e4-4557-a4e8-5e57140ee88b',
  original_id: '627a3236-af6c-444a-836c-9f0d1d27c21a',
  amount: 100,
  amount_refunded: 50,
  amount_refund_rest: 40,
  available_refund_items: [],
  billing_address: {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  },
  business_option_id: 12345,
  business_uuid: businessId,
  channel: 'channel_1',
  channel_set_uuid: 'c8cbcf36-032a-4ce7-a285-3df691c946f5',
  created_at: new Date('2020-10-19'),
  currency: 'EUR',
  customer_email: 'narayan@payever.de',
  customer_name: 'Narayan Ghimire',
  delivery_fee: 2.99,
  down_payment: 30,
  fee_accepted: true,
  history: [],
  is_shipping_order_processed: true,
  items: [
    {
      id: 'string',
      description: 'string',
      fixed_shipping_price: 100,
      identifier: 'string',
      item_type: 'string',
      name: 'options',
      options: undefined,
      price: 100,
      price_net: 90,
      product_variant_uuid: 'string',
      quantity: 3,
      sku: 'string',
      shipping_price: 10,
      shipping_settings_rate: 10,
      shipping_settings_rate_type: 'string',
      shipping_type: 'string',
      uuid: 'string',
      vat_rate: 19,
      thumbnail: 'string',
      updated_at: new Date('2020-12-12'),
      url: 'string',
      weight: 1,
      created_at: new Date('2020-12-12'),
    },
  ],
  merchant_email: 'merchant@payever.de',
  merchant_name: 'Merchant Doe',
  payment_details: { },
  payment_fee: 2,
  payment_flow_id: '67d3e998-8c6e-444f-9b5b-b2f38e8d532e',
  place: 'Bremen',
  reference: 'Reference 1',
  santander_applications: [],
  shipping_address: { },
  shipping_option_name: 'shipping_option_1',
  shipping_order_id: '8ca31b1f-87d0-4981-93e9-8c62d0de1e94',
  specific_status: 'ACCEPTED',
  status: 'PENDING',
  status_color: 'yellow',
  store_id: '1b42fd1c-3b28-47cf-b7fb-01c4281dc7f7',
  store_name: 'XYZ Store',
  type: 'type_1',
  updated_at: new Date('2020-12-12'),
  user_uuid: '6c08ca77-abb6-4d07-ae83-24653ea94a14',
  example: false,
  example_shipping_label: 'example_shipping_label_1',
  example_shipping_slip: 'example_shipping_slip_1',
  toObject(): any { return this; },
  save(): any { },
} as TransactionModel;


describe('ExporterService', () => {
  let sandbox: sinon.SinonSandbox;
  let elasticSearchService: FoldersElasticSearchService;
  let exporterService: ExporterService;
  let businessService: BusinessService;
  let configService: ConfigService;
  let httpService: HttpService;
  let logger: Logger;
  let rabbitClient: RabbitMqClient;

  const exportDto: ExportQueryDto  = new ExportQueryDto();
  exportDto.direction = 'desc';
  exportDto.columns = '[{"name":"merchant_name","title":"Merchant"},{"name":"status","title":"Status"}]';

  before(async () => {
    elasticSearchService = {
      getResult: (): PagingResultDto => {
        return {
          collection: [transaction],
          filters: undefined,
          pagination_data: {
            total: 1,
            page: 1,
            amount: 102.99,
            amount_currency: 'EUR',
          },
          usage: undefined,
        };
      },
    } as any;
    businessService = {
      findOneById: async (args: any): Promise<any> => { },
    } as any;
    configService = {
      get: async (): Promise<string> => { return 'DEFAULT_CURRENCY'; },
    } as any;
    httpService = {
      request: async (args: any): Promise<any> => { },
    } as any;
    logger = {
      error: async (args: any): Promise<any> => { },
      log: async (args: any): Promise<any> => { },
    } as any;
    rabbitClient = {
      send: async (args: any): Promise<void> => { },
    } as any;

    exporterService = new ExporterService(
      elasticSearchService,
      businessService,
      configService,
      httpService,
      logger,
      rabbitClient,
    );

  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('export', () => {
    it('should perform export xlsx successfully', async () => {

      exportDto.format = ExportFormatEnum.xlsx;
      const result: ExportedFileResultDto = await exporterService.exportBusinessTransactions(exportDto, businessId,  1);

    });

    it('should perform export successfully no format', async () => {

      const response: FastifyReply<any> = {
        header: (): any => { },
        send: (): any => { },
      } as any;

      sinon.stub(response, 'header');
      sinon.stub(response, 'send');

      exportDto.format = undefined;
      const result: ExportedFileResultDto = await exporterService.exportBusinessTransactions(exportDto, businessId,  1);

    });

    it('should perform export successfully pdf', async () => {

      const printer: PdfMakePrinter = {
        createPdfKitDocument: (): any => { },
      } as any;

      const document: any = {
        on: (): any => { },
        end: (): any => { },
      } as any;

      const response: FastifyReply<any> = {
        header: (): any => { },
        send: (): any => { },
      } as any;

      sinon.stub(printer, 'createPdfKitDocument').returns(document);

      const emitter: EventEmitter = new EventEmitter();
      sinon.stub(document, 'on').returns(emitter);
      sinon.stub(document, 'end');

      emitter.emit('end');
      document.end();

      exportDto.format = ExportFormatEnum.pdf;
      exporterService.exportBusinessTransactions(exportDto, businessId,  1);
      expect(document.end).calledOnce;
    });
  });

  describe('export PDF', () => {
    it('should perform exportPDF successfully', async () => {

      const printer: PdfMakePrinter = {
        createPdfKitDocument: (): any => { },
      } as any;

      const document: any = {
        on: (): any => { },
        end: (): any => { },
      } as any;

      sinon.stub(printer, 'createPdfKitDocument').returns(document);

      const emitter: EventEmitter = new EventEmitter();

      sinon.stub(document, 'on').returns(emitter);
      sinon.stub(document, 'end');

      emitter.emit('end');
      document.end();

    });
  });
});
