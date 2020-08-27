import * as chai from 'chai';
import 'mocha';
import * as sinonChai from 'sinon-chai';
import { OderInvoiceMailDtoConverter } from '../../../../src/transactions/converter';
import { TransactionCartItemDto } from '../../../../src/transactions/dto';
import { TransactionChangedDto } from '../../../../src/transactions/dto/checkout-rabbit';
import { AddressTypeEnum } from '../../../../src/transactions/enum';
chai.use(sinonChai);
const expect = chai.expect;

describe('PaymentMailDtoConverter ', () => {
  describe('convert method', () => {
    it('should convert data', () => {
      const templateName = 'order_invoice_template';

      const paymentSubmittedDto: TransactionChangedDto = {
        payment: {
          id: '',
          uuid: '96211c90-e563-4809-9091-a58b129428f0',
          amount: 2,
          currency: 'cur',
          delivery_fee: 10,
          reference: '123',
          total: 100,
          created_at: '2019-07-11',
          channel: 'channelName',
          business: {
            uuid: 'business_id',
          },
          items: [],
          customer_email: 'test customer email',
          customer_name: 'test customer name',
          address: {
            street: 'street name',
          },
          payment_type: 'payment_type',
        },
      } as TransactionChangedDto;

      const expectedResult = {
        to: paymentSubmittedDto.payment.customer_email,
        cc: [],
        template_name: templateName,
        business: {
          uuid: paymentSubmittedDto.payment.business.uuid,
        },
        payment: {
          id: paymentSubmittedDto.payment.id,
          amount: paymentSubmittedDto.payment.amount,
          delivery_fee: 10,
          currency: paymentSubmittedDto.payment.currency,
          reference: paymentSubmittedDto.payment.reference,
          uuid: paymentSubmittedDto.payment.uuid,
          total: paymentSubmittedDto.payment.total,
          created_at: paymentSubmittedDto.payment.created_at,
          customer_email: paymentSubmittedDto.payment.customer_email,
          customer_name: paymentSubmittedDto.payment.customer_name,
          address: paymentSubmittedDto.payment.address,
          vat_rate: 0,
          payment_option: {
            payment_details: paymentSubmittedDto.payment.payment_details,
            payment_method: paymentSubmittedDto.payment.payment_type,
          }
        },
        payment_items: [],
      };

      expect(
        OderInvoiceMailDtoConverter.fromTransactionChangedDto(paymentSubmittedDto),
      ).to.eql(
        expectedResult,
      );
    });

    it('should set proper template name', () => {
      const paymentSubmittedDto: TransactionChangedDto = {
        payment: {
          id: '74461861-b40d-4d69-b22e-f97d995ed70c',
          uuid: 'e210d66d-4e17-46fe-bfe9-32020f74b979',
          amount: 2,
          business: {
            uuid: '64a26d47-c4bd-4082-8cdf-c39149b0a08e',
          },
          address: {
            company: 'payever',
            country: 'Germany',
            country_name: 'Deutscheland',
            email: 'narayan@payever.de',
            fax: '0123456789',
            first_name: 'Narayan',
            last_name: 'Ghimire',
            mobile_phone: '+4915908134242',
            salutation: 'Dr.',
            street: 'street name',
            type: AddressTypeEnum.Billing,
          },
          currency: 'EUR',
          reference: '123',
          total: 100,
          created_at: '2019-07-11',
          channel: 'channelName',
          items: [{
            vat_rate: 13,
            price: 100,
            quantity: 5,
            name: 'iphone X',
            options: [{ key: 'Value' }],
            thumbnail: 'thumbnail_1.png',
            uuid: 'ae48cb90-598e-4d43-85db-d667af1101ba',
          }],
          customer_email: 'hello@world.com',
          customer_name: 'test customer name',
          delivery_fee: 1.09,
          payment_type: 'santandar_installment',

        },
      } as TransactionChangedDto;

      expect(
        OderInvoiceMailDtoConverter.fromTransactionChangedDto(paymentSubmittedDto),
      ).to.deep.eq({
        cc: [],
        to: 'hello@world.com',
        business: {
          uuid: '64a26d47-c4bd-4082-8cdf-c39149b0a08e',
        },
        template_name: 'order_invoice_template',

        payment: {
          id: '74461861-b40d-4d69-b22e-f97d995ed70c',
          uuid: 'e210d66d-4e17-46fe-bfe9-32020f74b979',
          amount: 2,
          created_at: '2019-07-11',
          reference: '123',
          currency: 'EUR',
          total: 100,
          vat_rate: 65,
          address: {
            company: 'payever',
            country: 'Germany',
            country_name: 'Deutscheland',
            email: 'narayan@payever.de',
            fax: '0123456789',
            first_name: 'Narayan',
            last_name: 'Ghimire',
            mobile_phone: '+4915908134242',
            salutation: 'Dr.',
            street: 'street name',
            type: AddressTypeEnum.Billing,
          },
          customer_email: 'hello@world.com',
          customer_name: 'test customer name',
          delivery_fee: 1.09,
          payment_option: {
            payment_details: undefined,
            payment_method: 'santandar_installment',
          },
        },
        payment_items: [{
          vat_rate: 13,
          price: 100,
          quantity: 5,
          name: 'iphone X',
          options: [{ key: 'Value' }],
          thumbnail: 'thumbnail_1.png',
          uuid: 'ae48cb90-598e-4d43-85db-d667af1101ba',
        }],
      });
    });

    it('should calculate tax, based on items vat rate amount', () => {
      const paymentSubmittedDto: TransactionChangedDto = {
        payment: {
          items: [
            {
              vat_rate: 2,
              price: 10,
              quantity: 1,
            },
            {
              vat_rate: 6,
              price: 20,
              quantity: 2,
            },
            {
              vat_rate: 7,
              price: 30,
              quantity: 3,
            },
          ],
          business: {
            uuid: 'business_id',
          },
        },
      } as TransactionChangedDto;

      const expectedVatRate = paymentSubmittedDto.payment.items.map(
        (item: TransactionCartItemDto) => item.vat_rate * item.price * item.quantity / 100,
      ).reduce((a, b) => a + b, 0);

      expect(
        OderInvoiceMailDtoConverter.fromTransactionChangedDto(paymentSubmittedDto).payment.vat_rate,
      ).to.eql(
        expectedVatRate,
      );
    });
  });
});
