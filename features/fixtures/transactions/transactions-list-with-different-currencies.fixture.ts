import { BaseFixture } from '@pe/cucumber-sdk';
import { BusinessModel, TransactionModel } from '../../../src/transactions/models';
import { businessFactory, currencyFactory, transactionFactory } from '../factories';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { BusinessSchemaName, TransactionSchemaName } from '../../../src/transactions/schemas';
import { CurrencyModel, CurrencySchemaName } from '@pe/common-sdk';

const businessId1: string = '36bf8981-8827-4c0c-a645-02d9fc6d72c8';
const businessId2: string = 'b109cac7-e47e-40a2-ab3f-c3b339a2cc73';
const userId: string = '08a3fac8-43ef-4998-99aa-cabc97a39261';
const businessCurrency: string  = 'USD';

export class TransactionsListWithDifferentCurrenciesFixture extends BaseFixture {

  private readonly transactionModel: Model<TransactionModel> = this.application.get(getModelToken(TransactionSchemaName));
  private readonly currencyModel: Model<CurrencyModel> = this.application.get(getModelToken(CurrencySchemaName));
  private readonly businessModel: Model<BusinessModel> = this.application.get(getModelToken(BusinessSchemaName));

  public async apply(): Promise<void> {

    await this.createCurrenciesWithRates();

    await this.transactionModel.create(transactionFactory.create({
      uuid: 'aff4765d-94ab-4da1-892c-3a8f8199b509',
      businessId : businessId1,
      user_uuid: userId,
      amount: 50,
      total: 50,
      currency: 'EUR',
    }));

    await this.transactionModel.create(transactionFactory.create({
      uuid: '778ca3c6-a71c-429c-a9b8-899a0e0f4e23',
      businessId : businessId1,
      user_uuid: userId,
      amount: 50,
      total: 50,
      currency: 'USD',
    }));

    await this.transactionModel.create(transactionFactory.create({
      uuid: '5456c5e1-3c48-4d2c-a731-f91ab09c856f',
      businessId : businessId1,
      amount: 50,
      total: 50,
      currency: 'DK',
    }));

    await this.transactionModel.create(transactionFactory.create({
      uuid: 'c35ce841-13f5-4406-8a2d-7859930b69a6',
      businessId : businessId1,
      amount: 50,
      total: 50,
      currency: 'CZK',
    }));

    await this.transactionModel.create(transactionFactory.create({
      uuid: 'aff4765d-94ab-4da1-892c-3a8f8199b502',
      businessId : businessId2,
      user_uuid: userId,
      amount: 50,
      total: 50,
      currency: 'EUR',
    }));

    await this.transactionModel.create(transactionFactory.create({
      uuid: '778ca3c6-a71c-429c-a9b8-899a0e0f4e22',
      businessId : businessId2,
      user_uuid: userId,
      amount: 50,
      total: 50,
      currency: 'USD',
    }));

    await this.transactionModel.create(transactionFactory.create({
      uuid: '5456c5e1-3c48-4d2c-a731-f91ab09c8562',
      businessId : businessId2,
      amount: 50,
      total: 50,
      currency: 'DK',
    }));

    await this.transactionModel.create(transactionFactory.create({
      uuid: 'c35ce841-13f5-4406-8a2d-7859930b69a2',
      businessId : businessId2,
      amount: 50,
      total: 50,
      currency: 'CZK',
    }));

    await this.businessModel.create(businessFactory.create({
      _id: businessId1,
      currency: businessCurrency,
    }));
    await this.businessModel.create(businessFactory.create({
      _id: businessId2,
      currency: businessCurrency,
    }));

  }

  private async createCurrenciesWithRates(): Promise<void> {
    await this.currencyModel.create(currencyFactory.create({
      _id: 'EUR',
      rate: 0.9,
    }));

    await this.currencyModel.create(currencyFactory.create({
      _id: 'USD',
      rate: 1,
    }));

    await this.currencyModel.create(currencyFactory.create({
      _id: 'DK',
      rate: 0.8,
    }));

    await this.currencyModel.create(currencyFactory.create({
      _id: 'CZK',
      rate: 0.7,
    }));
  }
}

export = TransactionsListWithDifferentCurrenciesFixture;
