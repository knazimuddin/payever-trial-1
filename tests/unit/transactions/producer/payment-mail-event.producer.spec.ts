import { Test } from '@nestjs/testing';
import { RabbitMqClient } from '@pe/nest-kit';
import * as chai from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { OderInvoiceMailDtoConverter, ShippingGoodsMailDtoConverter } from '../../../../src/transactions/converter';
import { PaymentStatusesEnum } from '../../../../src/transactions/enum';
import { PaymentMailEventProducer } from '../../../../src/transactions/producer';
import { TransactionChangedDto } from '../../../../src/transactions/dto/checkout-rabbit';
import { TransactionUnpackedDetailsInterface } from '../../../../src/transactions/interfaces';
import { ShippingOrderProcessedMessageDto, ShippingMailDto } from '../../../../src/transactions/dto';

chai.use(sinonChai);
const expect = chai.expect;

describe('PaymentMailEventProducer ', () => {
  let sandbox: sinon.SinonSandbox;
  let paymentMailEventProducer: PaymentMailEventProducer;
  let rabbitMqClient: RabbitMqClient;

  before(async () => {
    const module = await Test.createTestingModule({
      controllers: [PaymentMailEventProducer],
      providers: [
        {
          provide: RabbitMqClient,
          useValue: {
            send: () => {},
          },
        },
      ],
    }).compile();

    rabbitMqClient = module.get<RabbitMqClient>(RabbitMqClient);
    paymentMailEventProducer = module.get<PaymentMailEventProducer>(PaymentMailEventProducer);
  });

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(rabbitMqClient, 'send').resolves();
  });

  afterEach(async () => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('produceShippingEvent method', () => {
    it('should send mail for shipping event ', async () => {
      const eventName = 'payever.event.payment.email';

      const transaction: TransactionUnpackedDetailsInterface = {
        id: '18600e2d-8bd0-4d07-a8e6-ddec50a1cb9e',
        original_id: '6bceacfc-178e-4cc5-a91f-2104cf04c1a0',
        uuid: 'b4fd1c4d-d2b6-4484-be63-8f5d027d4585',
        action_running: true,
        amount: 123,
        amount_refunded: 456,
        amount_rest: 789,
        available_refund_items: [
          {
            count: 123,
            item_uuid: '612ee040-821e-47db-b7f7-487e617e89fc',
          },
        ],
        billing_address: {
          city: 'Hamburg',
          company: 'Payever',
          country: 'DE',
          country_name: 'Germany',
          email: 'billing@payever.de',
          fax: '123456789',
          first_name: 'Narayan',
          last_name: 'Ghimire',
          mobile_phone: '015912345678',
          phone: '1238344884',
          salutation: 'Prof',
          social_security_number: '1234567890',
          street: 'rodings markts',
          type: 'billing',
          zip_code: '12344',
        },
        business_option_id: 12,
        business_uuid: 'fd45dae7-27c1-46c4-9309-d4d0fbd67a8d',
        channel: 'channel_1', // 'store', ...
        channel_uuid: '0b66ec21-1de8-4f63-8776-8cdc0ceba73e',
        channel_set_uuid: 'a20927f2-738b-4a65-8e13-59453fbd06c9',
        created_at: new Date('2009-11-04T18:55:41.000Z'),
        currency: 'EUR',
        customer_email: 'customer@payever.de',
        customer_name: 'Dario',
        delivery_fee: 345,
        down_payment: 678,
        fee_accepted: true,
        history: [],
        items: [{
          name: 'name_1',
          options: [],
          price: 123,
          quantity: 10,
          thumbnail: 'thumbnail.png',
          uuid: '42b45418-85eb-45fa-b80d-1bfa19d653f2',
          vat_rate: 13,
        }],
        merchant_email: 'merchant@email.de',
        merchant_name: 'Merchant Mann',
        payment_fee: 123,
        payment_flow_id: '921fb499-6250-4773-9615-1e2d179af30a',
        payment_details: {},
        place: 'Hamburg',
        reference: 'reference',
        shipping_address: {},
        shipping_category: 'category_1',
        shipping_method_name: 'dhl',
        shipping_option_name: 'dhl-option',
        shipping_order_id: '75fa57b4-ef38-46ae-8abc-88e6cab1e23b',
        is_shipping_order_processed: true,
        specific_status: 'STATUS',
        status: 'ACCEPTED',
        status_color: 'GREEN',
        store_id: '4deedcf7-255c-466f-ae25-9073b349dcc7',
        store_name: 'wallmart',
        total: 901,
        type: 'type_1',
        updated_at: new Date('2019-11-04T18:55:41.000Z'),
        user_uuid: '4e75b65b-3f89-4c11-9fc8-a8b2a34fa86d',

        example: true,
        example_shipping_label: 'example_label_1',
        example_shipping_slip: 'example_slip_1',
      } as TransactionUnpackedDetailsInterface;

      const dto: ShippingOrderProcessedMessageDto = {
        transactionId: '449b0769-a120-41e2-a9c0-79195bafc8e5',
        trackingNumber: '12345',
        trackingUrl: 'www.dhl.de/tracking/12345',
      }

      const shippingMailDto: ShippingMailDto = ShippingGoodsMailDtoConverter.fromTransactionAndShippingOrder(transaction, dto);

      await paymentMailEventProducer.produceShippingEvent(shippingMailDto);

      expect(rabbitMqClient.send).to.have.been.calledWithMatch(
        {
          exchange: 'async_events',
          channel: eventName,
        },
        {
          name: eventName,
          payload: shippingMailDto,
        },
      );
    });
  });

  describe('produceOrderInvoiceEvent method', () => {
    const availableChannels = ['shop', 'mail'];
    const unsuccessfulStatuses = [
      PaymentStatusesEnum.Declined,
      PaymentStatusesEnum.Failed,
      PaymentStatusesEnum.Cancelled,
      PaymentStatusesEnum.Refunded,
    ];

    for (const channelName of availableChannels) {
      it(`should send payment mail dto if channel is ${channelName}`, async () => {
        const eventName = 'payever.event.payment.email';

        const paymentSubmittedDto: TransactionChangedDto = {
          payment: {
            channel: channelName,
            business: {
              uuid: 'business_id',
            },
            items: [],
          },
        } as TransactionChangedDto;

        await paymentMailEventProducer.produceOrderInvoiceEvent(paymentSubmittedDto);

        expect(rabbitMqClient.send).to.have.been.calledWithMatch(
          {
            exchange: 'async_events',
            channel: eventName,
          },
          {
            name: eventName,
            payload: OderInvoiceMailDtoConverter.fromTransactionChangedDto(paymentSubmittedDto),
          },
        );
      });

      for (const status of unsuccessfulStatuses) {
        it(`should not send payment mail dto if status is ${status} and channel is ${channelName}`, async () => {

          const paymentSubmittedDto: TransactionChangedDto = {
            payment: {
              channel: channelName,
              status: status,
              business: {
                uuid: 'business_id',
              },
              items: [],
            },
          } as TransactionChangedDto;

          await paymentMailEventProducer.produceOrderInvoiceEvent(paymentSubmittedDto);

          expect(rabbitMqClient.send).to.have.not.been.called;
        });
      }
    }

    it(`should not send payment mail dto if channel is not in ${availableChannels.join(',')}`, async () => {

      const paymentSubmittedDto: TransactionChangedDto = {
        payment: {
          channel: 'not shop channel',
        },
      } as TransactionChangedDto;

      await paymentMailEventProducer.produceOrderInvoiceEvent(paymentSubmittedDto);

      expect(rabbitMqClient.send).to.have.not.been.called;
    });
  });
});
