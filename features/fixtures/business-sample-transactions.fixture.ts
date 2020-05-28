import { BaseFixture } from '@pe/cucumber-sdk';
import { Model } from "mongoose";
import { SampleProductsModel, TransactionExampleModel } from '../../src/transactions/models';
import { sampleProductFactory, transactionFactory } from './factories';

class BusinessEventsFixture extends BaseFixture {
  private readonly sampleProductsModel: Model<SampleProductsModel> = this.application.get('SampleProductsModel');
  private readonly transactionExampleModel: Model<TransactionExampleModel> = this.application.get('TransactionExampleModel');

  public async apply(): Promise<void> {

    await this.transactionExampleModel.create(transactionFactory.create({country: "DE"}));
    await this.transactionExampleModel.create(transactionFactory.create({country: "DE"}));
    await this.transactionExampleModel.create(transactionFactory.create({country: "DE"}));

    await this.sampleProductsModel.create(sampleProductFactory({}));
    await this.sampleProductsModel.create(sampleProductFactory({}));
    await this.sampleProductsModel.create(sampleProductFactory({}));
    await this.sampleProductsModel.create(sampleProductFactory({}));
    await this.sampleProductsModel.create(sampleProductFactory({}));
    await this.sampleProductsModel.create(sampleProductFactory({}));
    await this.sampleProductsModel.create(sampleProductFactory({}));
    await this.sampleProductsModel.create(sampleProductFactory({}));
  }
}

export = BusinessEventsFixture;
