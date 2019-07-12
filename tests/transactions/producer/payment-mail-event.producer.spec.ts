import { Test } from '@nestjs/testing';
import { RabbitMqClient } from '@pe/nest-kit';
import * as chai from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { PaymentMailDtoConverter } from '../../../src/transactions/converter';
import { PaymentSubmittedDto } from '../../../src/transactions/dto';
import { PaymentStatusesEnum } from '../../../src/transactions/enum';
import { PaymentMailEventProducer } from '../../../src/transactions/producer';

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
            sendAsync: () => {},
          },
        },
      ],
    }).compile();

    rabbitMqClient = module.get<RabbitMqClient>(RabbitMqClient);
    paymentMailEventProducer = module.get<PaymentMailEventProducer>(PaymentMailEventProducer);
  });

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(rabbitMqClient, 'sendAsync').resolves();
  });

  afterEach(async () => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('produceOrderInvoiceEvent method', () => {
    const availableChannels = ['pos', 'shop', 'mail'];
    const unsuccessfulStatuses = [
      PaymentStatusesEnum.Declined,
      PaymentStatusesEnum.Failed,
      PaymentStatusesEnum.Cancelled,
      PaymentStatusesEnum.Refunded,
    ];

    for (const channelName of availableChannels) {
      it(`should send payment mail dto if channel is ${channelName}`, async () => {
        const eventName = 'payever.event.payment.email';

        const paymentSubmittedDto: PaymentSubmittedDto = {
          payment: {
            channel: channelName,
            business: {
              uuid: 'business_id',
            },
            items: [],
          },
        } as PaymentSubmittedDto;

        await paymentMailEventProducer.produceOrderInvoiceEvent(paymentSubmittedDto);

        expect(rabbitMqClient.sendAsync).to.have.been.calledWithMatch(
          {
            exchange: 'async_events',
            channel: eventName,
          },
          {
            name: eventName,
            payload: PaymentMailDtoConverter.fromPaymentSubmittedDto(paymentSubmittedDto),
          },
        );
      });

      for (const status of unsuccessfulStatuses) {
        it(`should not send payment mail dto if status is ${status} and channel is ${channelName}`, async () => {

          const paymentSubmittedDto: PaymentSubmittedDto = {
            payment: {
              channel: channelName,
              status: status,
              business: {
                uuid: 'business_id',
              },
              items: [],
            },
          } as PaymentSubmittedDto;

          await paymentMailEventProducer.produceOrderInvoiceEvent(paymentSubmittedDto);

          expect(rabbitMqClient.sendAsync).to.have.not.been.called;
        });
      }
    }

    it(`should not send payment mail dto if channel is not in ${availableChannels.join(',')}`, async () => {

      const paymentSubmittedDto: PaymentSubmittedDto = {
        payment: {
          channel: 'not shop channel',
        },
      } as PaymentSubmittedDto;

      await paymentMailEventProducer.produceOrderInvoiceEvent(paymentSubmittedDto);

      expect(rabbitMqClient.sendAsync).to.have.not.been.called;
    });
  });
});
