import { BaseFixture } from '@pe/cucumber-sdk';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { FolderDocumentSchemaName, FolderDocumentModel } from '@pe/folders-plugin';

const folderId: string = '97d9f445-8d7f-4cdf-aa80-7d1bfef7c21f';
const businessId1: string = '36bf8981-8827-4c0c-a645-02d9fc6d72c8';

export class FolderDocumentFixture extends BaseFixture {

  private readonly folderDocuments: Model<FolderDocumentModel> =
    this.application.get(getModelToken(FolderDocumentSchemaName));

  public async apply(): Promise<void> {

    await this.folderDocuments.create(
      {
        businessId: businessId1,
        documentId: 'aff4765d-94ab-4da1-892c-3a8f8199b509',
        folderId: folderId,
      });

    await this.folderDocuments.create(
      {
        businessId: businessId1,
        documentId: '778ca3c6-a71c-429c-a9b8-899a0e0f4e23',
        folderId: folderId,
      });
  }
}

export = FolderDocumentFixture;
