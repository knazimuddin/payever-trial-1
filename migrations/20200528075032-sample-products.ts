import {
  BRANCHE_AUTOMOTIVE,
  BRANCHE_BABY,
  BRANCHE_CARE,
  BRANCHE_ELECTRONICS,
  BRANCHE_FASHION,
  BRANCHE_HEALTH_HOUSEHOLD,
  BRANCHE_HOME_KITCHEN,
  BRANCHE_LUGGAGE,
  BRANCHE_MATERIAL_HANDLINGS,
  BRANCHE_SPORTS,
  BRANCHE_TOYS,
} from './20200528075032-sample-products/data';


import { BaseMigration } from "@pe/migration-kit";

export class SampleProducts extends BaseMigration {

  public async up(): Promise<void> {
    await this.connection.dropCollection('sampleproducts');
    const model = this.connection.model('SampleProducts');

    await model.insertMany(BRANCHE_MATERIAL_HANDLINGS);
    await model.insertMany(BRANCHE_TOYS);
    await model.insertMany(BRANCHE_FASHION);
    await model.insertMany(BRANCHE_ELECTRONICS);
    await model.insertMany(BRANCHE_AUTOMOTIVE);
    await model.insertMany(BRANCHE_BABY);
    await model.insertMany(BRANCHE_SPORTS);
    await model.insertMany(BRANCHE_HOME_KITCHEN);
    await model.insertMany(BRANCHE_HEALTH_HOUSEHOLD);
    await model.insertMany(BRANCHE_CARE);
    await model.insertMany(BRANCHE_LUGGAGE);
  };

  public async down(): Promise<void> {
    return null;
  };

  public description(): string {
    return '';
  };

  public migrationName(): string {
    return 'SampleProducts';
  };

  public version(): number {
    return 1;
  };
}
