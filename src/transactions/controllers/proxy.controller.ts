import { Controller, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, UseGuards, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Acl, AclActionsEnum } from '@pe/nest-kit';
import { AccessTokenPayload, JwtAuthGuard, Roles, RolesEnum, User, UserRoleInterface, UserRoleOauth } from '@pe/nest-kit/modules/auth';
import { TransactionPaymentDetailsConverter } from '../converter';
import { TransactionUnpackedDetailsInterface } from '../interfaces/transaction';
import { TransactionModel } from '../models';
import { ThirdPartyCallerService, TransactionsService } from '../services';
import { FastifyReply } from 'fastify';
import { Readable } from 'stream';

@Controller('proxy')
@ApiTags('proxy')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProxyController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly thirdPartyCaller: ThirdPartyCallerService,
  ) { }

  @Get('download-contract/:original_id')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesEnum.merchant, RolesEnum.oauth)
  @Acl({ microservice: 'transactions', action: AclActionsEnum.read })
  public async downloadContract(
    @Param('original_id') transactionId: string,
    @User() user: AccessTokenPayload,
    @Res() response: FastifyReply<any>,
  ): Promise<void> {
    const transaction: TransactionModel = await this.transactionsService.findModelByParams({
      original_id: transactionId,
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction by id ${transactionId} not found`);
    }

    const businessId: string = this.getOauthUserBusiness(user, transaction.business_uuid);

    if (transaction.business_uuid !== businessId) {
      throw new ForbiddenException(`You're not allowed to get transaction with id ${transactionId}`);
    }

    const unpackedTransaction: TransactionUnpackedDetailsInterface = TransactionPaymentDetailsConverter.convert(
      transaction.toObject({ virtuals: true }),
    );

    const result: { contentType: string, filenameWithExtension: string, base64Content: string } =
      await this.thirdPartyCaller.downloadContract(unpackedTransaction);

    const buffer: Buffer = Buffer.from(result.base64Content, 'base64');

    const stream: Readable = new Readable();
    stream.push(buffer);
    stream.push(null);

    response.header('Content-Type', result.contentType);
    response.header('Content-Disposition', `attachment; filename=${result.filenameWithExtension}`);
    response.header('Content-Length', buffer.length);

    response.send(stream);
  }

  private getOauthUserBusiness(user: AccessTokenPayload, businessId?: string): string
  {
    const userRole: UserRoleInterface = user.roles.find((x: UserRoleInterface) => x.name === RolesEnum.oauth);
    if (!userRole) {
      return null;
    }

    const oauthRole: UserRoleOauth = userRole as UserRoleOauth;
    if (businessId) {
      for (const permission of oauthRole.permissions) {
        if (permission.businessId === businessId) {
          return permission.businessId;
        }
      }

      return null;
    }

    return oauthRole.permissions[0].businessId;
  }
}
