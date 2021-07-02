import { BaseFixture } from '@pe/cucumber-sdk';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { FolderExcludedDocumentSchemaName, FolderExcludedDocumentModel } from '@pe/folders-plugin';

const businessId1: string = '36bf8981-8827-4c0c-a645-02d9fc6d72c8';

export class FolderExcludedDocumentFixture extends BaseFixture {

  private readonly excludedDocuments: Model<FolderExcludedDocumentModel> =
    this.application.get(getModelToken(FolderExcludedDocumentSchemaName));

  public async apply(): Promise<void> {

    await this.excludedDocuments.create(
    {
      businessId: businessId1,
      documentId: 'aff4765d-94ab-4da1-892c-3a8f8199b509',
    });
  }
}

export = FolderExcludedDocumentFixture;
