import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import { Exporter } from '../../../../src/transactions/tools';
import * as uuid from 'uuid';
import { TransactionModel } from '../../../../src/transactions/models';
import { FastifyReply } from 'fastify';
import * as PdfMakePrinter from 'pdfmake/src/printer';
import { EventEmitter } from 'events';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('Exporter', () => {
  let sandbox: sinon.SinonSandbox;
  
  const transaction: TransactionModel = {
    id: '4416ed60-93e4-4557-a4e8-5e57140ee88b',
    original_id: '627a3236-af6c-444a-836c-9f0d1d27c21a',
    amount: 100,
    amount_refunded: 50,
    amount_rest: 40,
    available_refund_items: [],
    billing_address: {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    },
    business_option_id: 12345,
    business_uuid: 'd82bd863-26e5-4182-9a6b-f1dcc8507cb1',
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
    items: [],
    merchant_email: 'merchant@payever.de',
    merchant_name: 'Merchant Doe',
    payment_details: {},
    payment_fee: 2,
    payment_flow_id: '67d3e998-8c6e-444f-9b5b-b2f38e8d532e',
    place: 'Bremen',
    reference: 'Reference 1',
    santander_applications: [],
    shipping_address: {},
    shipping_option_name: 'shipping_option_1',
    shipping_order_id: '8ca31b1f-87d0-4981-93e9-8c62d0de1e94',
    specific_status: 'ACCEPTED',
    status: 'PENDING',
    status_color: 'yellow',
    store_id: '1b42fd1c-3b28-47cf-b7fb-01c4281dc7f7',
    store_name: 'XYZ Store',
    //total: 200,
    type: 'type_1',
    updated_at: new Date('2020-12-12'),
    user_uuid: '6c08ca77-abb6-4d07-ae83-24653ea94a14',
    example: false,
    example_shipping_label: 'example_shipping_label_1',
    example_shipping_slip: 'example_shipping_slip_1',
    toObject(): any { return this },
    save(): any { },
  } as TransactionModel;

  before(() => {
    
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('export', () => {
    it('should perform export xls successfully', async () => {
      
      const response: FastifyReply<any> = {
        header: (): any => { },
        send: (): any => { },
      } as any;

      sinon.stub(response, "header");
      sinon.stub(response, "send");

      Exporter.export([transaction], response, "result.csv", 
        [{title:'Merchant',name:'merchant_name'},{title:'Status',name:'status'}],
        'xls');
      expect(response.header).calledThrice;
      expect(response.send).calledOnce;
    });

    it('should perform export successfully no format', async () => {
      
      const response: FastifyReply<any> = {
        header: (): any => { },
        send: (): any => { },
      } as any;

      sinon.stub(response, "header");
      sinon.stub(response, "send");

      Exporter.export([transaction], response, "result.csv", 
        [{title:'Merchant',name:'merchant_name'},{title:'Status',name:'status'}]);
      expect(response.header).calledThrice;
      expect(response.send).calledOnce;
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

      sinon.stub(printer, "createPdfKitDocument").returns(document);

      const emitter = new EventEmitter();
      sinon.stub(document, "on").returns(emitter);
      sinon.stub(document, "end");

      emitter.emit('end');
      document.end();
      
      Exporter.export([transaction, transaction], response, "result.pdf", 
        [{title:'Merchant',name:'merchant_name'},{title:'Created',name:'created_at'},{title:'None',name:'none'}], 
        'pdf');
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

      const response: FastifyReply<any> = {
        header: (): any => { },
        send: (): any => { },
      } as any;

      sinon.stub(printer, "createPdfKitDocument").returns(document);

      const emitter = new EventEmitter();
      sinon.stub(document, "on").returns(emitter);
      sinon.stub(document, "end");

      emitter.emit('end');
      document.end();

      Exporter.exportPDF([transaction], response, "result.pdf", []);
      expect(document.end).calledOnce;
    });
  });
});
