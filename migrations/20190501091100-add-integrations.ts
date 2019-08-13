import { integrationsFixture } from '../fixtures/integrations.fixture';

const integrationsCollection: string = 'integrations';

async function up(db: any): Promise<any> {
  for (const fixture of integrationsFixture) {
    const existing: Array<{}> = await db._find(integrationsCollection, { _id: fixture._id });

    if (!existing.length) {
      await db.insert('integrations', fixture);
    }
  }

  return null;
}

function down(): any {
  return null;
}

module.exports.up = up;
module.exports.down = down;
