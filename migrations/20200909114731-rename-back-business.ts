import { BaseMigration } from '@pe/migration-kit';

export class RenameBackBusinessMigration extends BaseMigration {business_uuid

  public async up(): Promise<void> {
    try {
      await this.connection.collection('businesspaymentoptions').dropIndex('businessId_1_completed_1_payment_method_1_status_1');
    } catch(e) { }

    await this.connection.collection('businesspaymentoptions').update(
      {
        businessId: {
          $exists: true,
        },
      },
      {
        $rename: {
          businessId: 'business_uuid',
        },
      },
      {
        multi: true,
        upsert: false,
      },
    );

    try {
      await this.connection.collection('transactions').dropIndex('businessId_1');
      await this.connection.collection('transactions').dropIndex('businessId_1_example_1');
    } catch(e) { }

    await this.connection.collection('transactions').update(
      {
        businessId: {
          $exists: true,
        },
      },
      {
        $rename: {
          businessId: 'business_uuid',
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
    return 'RenameBackBusiness';
  };

  public version(): number {
    return 1;
  };
}
