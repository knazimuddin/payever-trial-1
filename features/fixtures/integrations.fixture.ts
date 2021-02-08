import { BaseFixture } from '@pe/cucumber-sdk/module';

class IntegrationsFixture extends BaseFixture {
  public async apply(): Promise<void> {
    await this.connection.collection('integrations').insertMany([
      {
        category: 'shopsystems',
        name: 'shopify',
      },
      {
        category: "shopsystems",
        name: 'api',
      },
    ]);
  }
}

export = IntegrationsFixture;
