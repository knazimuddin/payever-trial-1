import { getModelToken } from '@nestjs/mongoose';
import { BaseFixture } from '@pe/cucumber-sdk';
import { Model } from 'mongoose';
import { RuleModel, RuleSchemaName, RuleActionEnum, RulesConditionEnum } from '@pe/rules-sdk';

const RULE_1: string = '5ef6f532-c9e9-12eb-b8bc-0242ac130003';
const RULE_2: string = '81f8be4e-c9e9-12eb-b8bc-0242ac130003';
const RULE_3: string = '8801657a-c9e9-12eb-b8bc-0242ac130003';
const RULE_4: string = '6325778c-375c-4c90-bedb-52c8e5490206';

class BusinessRulesFixture extends BaseFixture {
  private readonly SettingsModel: Model<RuleModel> = this.application.get(
    getModelToken(RuleSchemaName),
  );

  public async apply(): Promise<void> {
    const Settings: any[] = [
      {
        _id: RULE_1,
        action: RuleActionEnum.move,
        condition: RulesConditionEnum.greaterThan,
        createdAt: new Date(),
        description: 'rule description greater than 1000',
        field: 'total',
        folderId: '0bef2ea7-f12d-4700-b9f8-e5e2f8376597',
        name: 'greater than 1000',
        updatedAt: new Date(),
        values: [
          1000,
        ],
      },
      {
        _id: RULE_2,
        action: RuleActionEnum.move,
        condition: RulesConditionEnum.equals,
        createdAt: new Date(),
        description: 'rule description status refunded',
        field: 'status',
        folderId: 'a844b59b-310f-460c-b077-7d779652ded8',
        name: 'Refunded',
        updatedAt: new Date(),
        values: [
          'STATUS_REFUNDED',
        ],
      },
      {
        _id: RULE_3,
        action: RuleActionEnum.copy,
        condition: RulesConditionEnum.contains,
        createdAt: new Date(),
        description: 'rule description contains facebook',
        field: 'channel',
        folderId: 'e70b6a32-e7ef-4db5-9e51-a6ca6db692c6',
        name: 'Facebook',
        updatedAt: new Date(),
        values: [
          'facebook',
        ],
      },
      {
        _id: RULE_4,
        action: RuleActionEnum.copy,
        condition: RulesConditionEnum.equals,
        createdAt: new Date(),
        description: 'status accepted',
        field: 'status',
        folderId: 'dc106598-e61e-11eb-ba80-0242ac130004',
        name: 'STATUS_ACCEPTED',
        updatedAt: new Date(),
        values: [
          'STATUS_ACCEPTED',
        ],
      },
    ];
    await this.SettingsModel.create(Settings);
  }
}

export = BusinessRulesFixture;
