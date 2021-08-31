import { BaseMigration } from '@pe/migration-kit';

export class UpdateBusinessIdMigration extends BaseMigration {

  public async up(): Promise<void> {
    try {
      await this.connection.collection('businesspaymentoptions').dropIndex('business_uuid_1_completed_1_payment_method_1_status_1');
    } catch(e) { }

    await this.connection.collection('businesspaymentoptions').update(
      {
        business_uuid: {
          $exists: true,
        },
      },
      {
        $rename: {
          business_uuid: 'businessId',
        },
      },
      {
        multi: true,
        upsert: false,
      },
    );

    try {
      await this.connection.collection('transactions').dropIndex('business_uuid_1');
      await this.connection.collection('transactions').dropIndex('business_uuid_1_example_1');
    } catch(e) { }

    await this.connection.collection('transactions').update(
      {
        business_uuid: {
          $exists: true,
        },
      },
      {
        $rename: {
          business_uuid: 'businessId',
        },
      },
      {
        multi: true,
        upsert: false,
      },
    );

    return null;
  };

  public async down(): Promise<void> {
    return null;
  };

  public description(): string {
    return '';
  };

  public migrationName(): string {
    return 'UpdateBusinessId';
  };

  public version(): number {
    return 1;
  };
}
