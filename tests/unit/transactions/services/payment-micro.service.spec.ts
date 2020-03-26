import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as uuid from 'uuid';
import { Model } from 'mongoose';
import { PaymentsMicroService } from '../../../../src/transactions/services/payments-micro.service';
import { LegalFormBusMessagesController } from '@pe/common-sdk';
import { Logger } from '@nestjs/common';
import { MessageBusService, MessageInterface } from '@pe/nest-kit';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect: Chai.ExpectStatic = chai.expect;

describe('PamentMicroService', () => {
  let sandbox: sinon.SinonSandbox;
  let testService: PaymentsMicroService;
  let logger: Logger;
  let messageBusService: MessageBusService;

  before(() => {
    messageBusService = {
      createMessage: (): any => { },
    } as any;
    testService = new PaymentsMicroService(logger, messageBusService);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('createPaymentMicroMessage', () => {
    it('should create payment micro message when stub is true', async () => {
      const message: MessageInterface = {
        name: 'message_name',
        payload: {},
      } as any;
      sandbox.stub(messageBusService, 'createMessage').returns(message);
      expect(
        testService.createPaymentMicroMessage('santander_installment', 'messageIdentifier', {}, true),
      ).to.deep.equal({
        name: 'payment_option.stub_proxy.sandbox',
        payload: {
          microservice_data: {
            message_identifier: 'messageIdentifier',
            message_name: 'payment_option.santander_installment.messageIdentifier',
            microservice_name: 'payment_santander_de',
            original_timeout: 15,
            payment_method: 'santander_installment',
          },
        },
      });
    });

    it('should create payment micro message when stub is false', async () => {
      const message: MessageInterface = {
        name: 'message_name',
        payload: {},
      } as any;
      sandbox.stub(messageBusService, 'createMessage').returns(message);
      expect(
        testService.createPaymentMicroMessage('santander_installment', 'messageIdentifier', {}, false),
      ).to.deep.equal(message);
    });

    it('should create payment micro message when stub default', async () => {
      const message: MessageInterface = {
        name: 'message_name',
        payload: {},
      } as any;
      sandbox.stub(messageBusService, 'createMessage').returns(message);
      expect(
        testService.createPaymentMicroMessage('santander_installment', 'messageIdentifier', {}),
      ).to.deep.equal(message);
    });
  });

  describe('getChannelByPaymentType()', () => {
    it('should return channel name by payment type when STUB is TRUE', async () => {
      sandbox.stub(testService, 'getMicroName').returns('payment_santander_invoice_de');
      expect(
        testService.getChannelByPaymentType('santander_installment', true),
      ).to.eq('rpc_payment_stub_proxy');
    });

    it('should return channel name by payment type when stub is FALSE', async () => {
      sandbox.stub(testService, 'getMicroName').returns('payment_santander_invoice_de');
      expect(
        testService.getChannelByPaymentType('santander_installment', false),
      ).to.eq('rpc_payment_santander_invoice_de');
    });

    it('should return channel name by payment type when stub default', async () => {
      sandbox.stub(testService, 'getMicroName').returns('payment_santander_invoice_de');
      expect(
        testService.getChannelByPaymentType('santander_installment'),
      ).to.eq('rpc_payment_santander_invoice_de');
    });

    it('should return channel name by payment type when stub is FALSE', async () => {
      sandbox.stub(testService, 'getMicroName').returns('payment_santander_invoice_de');
      expect(
        testService.getChannelByPaymentType('santander_installment', false),
      ).to.eq('rpc_payment_santander_invoice_de');
    });


    it('should return channel name by payment type when microName is null', async () => {
      sandbox.stub(testService, 'getMicroName').returns(null);
      expect(
        testService.getChannelByPaymentType('santander_installment', false),
      ).to.eq('rpc_checkout_micro');
    });
  });

  describe('getMicroName()', () => {
    it('should return microName', async () => {
      expect(
        testService.getMicroName('santander_installment'),
      ).eq('payment_santander_de');
      expect(
        testService.getMicroName('santander_ccp_installment'),
      ).eq('payment_santander_de');
      expect(
        testService.getMicroName('santander_pos_installment'),
      ).eq('payment_santander_de');
      
      expect(
        testService.getMicroName('santander_invoice_de'),
      ).eq('payment_santander_invoice_de');
      expect(
        testService.getMicroName('santander_pos_invoice_de'),
      ).eq('payment_santander_invoice_de');

      expect(
        testService.getMicroName('santander_factoring_de'),
      ).eq('payment_santander_factoring_de');
      expect(
        testService.getMicroName('santander_pos_factoring_de'),
      ).eq('payment_santander_factoring_de');

      expect(
        testService.getMicroName('santander_installment_no'),
      ).eq('payment_santander_no');
      expect(
        testService.getMicroName('santander_pos_installment_no'),
      ).eq('payment_santander_no');
      expect(
        testService.getMicroName('santander_invoice_no'),
      ).eq('payment_santander_no');
      expect(
        testService.getMicroName('santander_pos_invoice_no'),
      ).eq('payment_santander_no');

      expect(
        testService.getMicroName('santander_installment_dk'),
      ).eq('payment_santander_dk');

      expect(
        testService.getMicroName('santander_installment_se'),
      ).eq('payment_santander_se');
      expect(
        testService.getMicroName('santander_pos_installment_se'),
      ).eq('payment_santander_se');

      expect(
        testService.getMicroName('sofort'),
      ).eq('payment_sofort');

      expect(
        testService.getMicroName('paypal'),
      ).eq('payment_paypal');

      expect(
        testService.getMicroName('stripe'),
      ).eq('payment_stripe');
      expect(
        testService.getMicroName('stripe_directdebit'),
      ).eq('payment_stripe');

      expect(
        testService.getMicroName('payex_creditcard'),
      ).eq('payment_payex');
      expect(
        testService.getMicroName('payex_faktura'),
      ).eq('payment_payex');

      expect(
        testService.getMicroName('cash'),
      ).eq('payment_wiretransfer');

      expect(
        testService.getMicroName('anythingElse'),
      ).eq(null);

    });
  });
});
