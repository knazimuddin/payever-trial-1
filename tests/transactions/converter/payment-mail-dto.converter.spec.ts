import * as chai from 'chai';
import 'mocha';
import * as sinonChai from 'sinon-chai';
import { OderInvoiceMailDtoConverter } from '../../../src/transactions/converter';
import { PaymentSubmittedDto } from '../../../src/transactions/dto';
import { TransactionCartItemDto } from '../../../src/transactions/dto/transaction-cart-item.dto';
chai.use(sinonChai);
const expect = chai.expect;

describe('PaymentMailDtoConverter ', () => {
  describe('convert method', () => {
    it('should convert data', () => {
      const templateName = 'order_invoice_template';

      const paymentSubmittedDto: PaymentSubmittedDto = {
        payment: {
          id: '',
          amount: 2,
          currency: 'cur',
          reference: '123',
          total: 100,
          created_at: new Date('2019-07-11'),
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
      } as PaymentSubmittedDto;

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
          currency: paymentSubmittedDto.payment.currency,
          reference: paymentSubmittedDto.payment.reference,
          total: paymentSubmittedDto.payment.total,
          created_at: paymentSubmittedDto.payment.created_at,
          customer_email: paymentSubmittedDto.payment.customer_email,
          customer_name: paymentSubmittedDto.payment.customer_name,
          address: paymentSubmittedDto.payment.address,
          vat_rate: 0,
          payment_option: {
            payment_method: paymentSubmittedDto.payment.payment_type,
          }
        },
        payment_items: [],
      };

      expect(
        OderInvoiceMailDtoConverter.fromPaymentSubmittedDto(paymentSubmittedDto),
      ).to.eql(
        expectedResult,
      );
    });

    it('should set proper template name', () => {
      const templateName = 'order_invoice_template';

      const paymentSubmittedDto: PaymentSubmittedDto = {
        payment: {
          id: '',
          amount: 2,
          currency: 'cur',
          reference: '123',
          total: 100,
          created_at: new Date('2019-07-11'),
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
        },
      } as PaymentSubmittedDto;

      expect(
        OderInvoiceMailDtoConverter.fromPaymentSubmittedDto(paymentSubmittedDto).template_name,
      ).to.eql(
        templateName,
      );
    });

    it('should calculate tax, based on items vat rate amount', () => {
      const paymentSubmittedDto: PaymentSubmittedDto = {
        payment: {
          items: [
            {
              vat_rate: 2,
            },
            {
              vat_rate: 6,
            },
            {
              vat_rate: 7,
            },
          ],
          business: {
            uuid: 'business_id',
          },
        },
      } as PaymentSubmittedDto;

      const expectedVatRate = paymentSubmittedDto.payment.items.map(
        (item: TransactionCartItemDto) => item.vat_rate,
      ).reduce((a, b) => a + b, 0);

      expect(
        OderInvoiceMailDtoConverter.fromPaymentSubmittedDto(paymentSubmittedDto).payment.vat_rate,
      ).to.eql(
        expectedVatRate,
      );
    });
  });
});
