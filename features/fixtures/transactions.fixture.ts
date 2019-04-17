import { BaseFixture } from '@pe/cucumber-sdk/module';
import { Model, Types } from 'mongoose';

const ObjectId = Types.ObjectId;

class TransactionsFixture extends BaseFixture {
  public async apply(): Promise<void> {
    this.connection.collection('transactions').insertOne({
      _id: new ObjectId('5c0a8e3781a52900101320b8'),
      uuid: 'c3735d0c-b70a-4e1c-9434-c8239deb6389',
      original_id: 'a1a39985f866f72679ffc9fb4841ad53',
      business_uuid: '8ed682d3-6319-4828-b264-834a863f79a7',
      invoice_id: 'invoice_id',
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
}

export = TransactionsFixture;
