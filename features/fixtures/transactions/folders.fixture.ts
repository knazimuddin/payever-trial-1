import { BaseFixture } from '@pe/cucumber-sdk';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { FolderSchemaName, FolderModel } from '@pe/folders-plugin';

const folderId: string = '97d9f445-8d7f-4cdf-aa80-7d1bfef7c21f';
const businessId1: string = '36bf8981-8827-4c0c-a645-02d9fc6d72c8';

export class FolderFixture extends BaseFixture {

  private readonly folder: Model<FolderModel> =
    this.application.get(getModelToken(FolderSchemaName));

  public async apply(): Promise<void> {

    await this.folder.create(
      {
        _id: folderId,
        business: businessId1,
        name: 'folder',
      });

  }
}

export = FolderFixture;
