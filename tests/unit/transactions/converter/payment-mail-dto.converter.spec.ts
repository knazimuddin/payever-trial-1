import * as chai from 'chai';
import 'mocha';
import * as sinonChai from 'sinon-chai';
import { OderInvoiceMailDtoConverter } from '../../../../src/transactions/converter';
import { TransactionCartItemDto } from '../../../../src/transactions/dto';
import { TransactionChangedDto } from '../../../../src/transactions/dto/checkout-rabbit';
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
      const templateName = 'order_invoice_template';

      const paymentSubmittedDto: TransactionChangedDto = {
        payment: {
          id: '',
          amount: 2,
          currency: 'cur',
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
        },
      } as TransactionChangedDto;

      expect(
        OderInvoiceMailDtoConverter.fromTransactionChangedDto(paymentSubmittedDto).template_name,
      ).to.eql(
        templateName,
      );
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