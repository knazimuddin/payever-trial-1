import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import { CreateIntegrationDto } from '../dto';
import { IntegrationModel } from '../models';
import { IntegrationService } from '../services';
import { Acl, AclActionsEnum } from '@pe/nest-kit';

@ApiBearerAuth()
@Controller('integration')
@UseGuards(JwtAuthGuard)
@ApiTags('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) { }

  @Post()
  @Roles(RolesEnum.admin)
  public async create(
    @Body() dto: CreateIntegrationDto,
  ): Promise<IntegrationModel> {
    return this.integrationService.create(dto);
  }

  @Get()
  @Roles(RolesEnum.merchant)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.read })
  public async findAll(): Promise<IntegrationModel[]> {
    return this.integrationService.findAll();
  }

  @Get(':integrationName')
  @Roles(RolesEnum.merchant)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.read })
  public async findByName(
    @Param('integrationName') integrationName: string,
  ): Promise<IntegrationModel> {
    return this.integrationService.findOneByName(integrationName);
  }
}
