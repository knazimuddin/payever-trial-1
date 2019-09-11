import * as mongoose from 'mongoose';
import { Db, Collection } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { InjectConnection } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '@pe/nest-kit';
import { Controller, Logger, Post, Body } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from '../../src/app.module';
import { ActionsRetriever } from '../../src/transactions/services';

import { santanderTransactionFixture } from './fixtures/santander-transaction.fixture';
import { pactEnvironment } from './pact-environment';

@Controller('setup')
class SetupController {
  constructor(
    @InjectConnection() private readonly connection: Db,
    private readonly logger: Logger,
  ) {}

  @Post()
  public async setup(
    @Body() state: any,
  ): Promise<void> {
    const transactionsCollection: Collection = this.connection.collection('transactions');
    await transactionsCollection.drop();

    if (state.state === 'Santander payment with pan_id and application_no') {
      await transactionsCollection.insertOne(santanderTransactionFixture);
      this.logger.log(`Populated fixture for state: ${state.state}`);
    }
  }
}

export const bootstrap: () => Promise<any> = async (): Promise<any> => {
  const mongod: MongoMemoryServer = new MongoMemoryServer();
  const mongoUri: string = await mongod.getConnectionString();

  const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        SetupController,
      ],
      imports: [
        AppModule,
      ],
    })
    .overrideProvider('DatabaseConnection')
      .useFactory({factory: (): mongoose.Connection => mongoose.createConnection(mongoUri)})
    .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: (): boolean => true })
    .overrideProvider(ActionsRetriever)
      .useValue({ retrieve: (): any => {} })
    .compile();

  const app: NestFastifyApplication = moduleFixture.createNestApplication<NestFastifyApplication>();
  app.setGlobalPrefix('/api');

  await app.listen(pactEnvironment.consumer.port, '0.0.0.0');

  return app;
};
