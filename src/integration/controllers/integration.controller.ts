import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUseTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesEnum } from '@pe/nest-kit/modules/auth';
import { CreateIntegrationDto } from '../dto';
import { IntegrationModel } from '../models';
import { IntegrationService } from '../services';

@ApiBearerAuth()
@Controller('integration')
@UseGuards(JwtAuthGuard)
@ApiUseTags('integration')
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
  public async findAll(): Promise<IntegrationModel[]> {
    return this.integrationService.findAll();
  }

  @Get(':integrationName')
  @Roles(RolesEnum.merchant)
  public async findByName(
    @Param('integrationName') integrationName: string,
  ): Promise<IntegrationModel> {
    return this.integrationService.findOneByName(integrationName);
  }
}