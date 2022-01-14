import { BaseMigration } from '@pe/migration-kit';
import { ScopeEnum } from '@pe/folders-plugin';

const folders: string = 'folders';

export class Migration20220112164500UpdateFolders extends BaseMigration {

  public async up(): Promise<void> {
    await this.connection.collection(folders).updateMany(
      { },
      {
        $set: {
          scope: ScopeEnum.Business,
        },
      },
    );
  }

  public async down(): Promise<void> {
    return null;
  }

  public description(): string {
    return 'Update Folders';
  }

  public migrationName(): string {
    return 'Migration20220112164500UpdateFolders';
  }

  public version(): number {
    return 1;
  }
}
