import { Test } from '@nestjs/testing';
import { RabbitMqClient } from '@pe/nest-kit';
import * as chai from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { AuthEventsProducer } from '../../../../src/transactions/producer';

chai.use(sinonChai);
const expect = chai.expect;

describe('AuthEventsProducer ', () => {
  let sandbox: sinon.SinonSandbox;
  let authEventsProducer: AuthEventsProducer;
  let rabbitMqClient: RabbitMqClient;

  before(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthEventsProducer],
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
    authEventsProducer = module.get<AuthEventsProducer>(AuthEventsProducer);
  });

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(rabbitMqClient, 'send').resolves();
  });

  afterEach(async () => {
    sandbox.restore();
    sandbox = undefined;
  });

  describe('getSellerName method', () => {
    it('should send getSellerName', async () => {
      const eventName = 'auth.commands.get_user_data';

      await authEventsProducer.getSellerName({ email: 'test@test.com' });

      expect(rabbitMqClient.send).to.have.been.calledWithMatch(
        {
          exchange: 'async_events',
          channel: eventName,
        },
        {
          name: eventName,
          payload: { email: 'test@test.com' },
        },
      );
    });
  });
});
