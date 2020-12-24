import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateIntegrationDto } from '../dto';
import { IntegrationModel } from '../models';

@Injectable()
export class IntegrationService {

  constructor(
    @InjectModel('Integration') private readonly integrationModel: Model<IntegrationModel>,
  ) { }

  public async findAll(): Promise<IntegrationModel[]> {
    return this.integrationModel.find();
  }

  public async findOneById(integrationId: string): Promise<IntegrationModel> {
      return this.integrationModel.findOne({ _id: integrationId });
  }

  public async findOneByName(integrationName: string): Promise<IntegrationModel> {
      return this.integrationModel.findOne({ name: integrationName });
  }

  public async create(
    data: CreateIntegrationDto,
  ): Promise<IntegrationModel> {
      return this.integrationModel.create(data as any);
  }
}
