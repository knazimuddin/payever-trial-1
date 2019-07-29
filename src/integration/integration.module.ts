import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseSchemas } from './config';
import { IntegrationController } from './controllers';
import { IntegrationService } from './services';

@Module({
  controllers: [
    IntegrationController,
  ],
  exports: [
    IntegrationService,
  ],
  imports: [
    HttpModule,
    MongooseModule.forFeature(MongooseSchemas),
  ],
  providers: [
    IntegrationService,
  ],
})
export class IntegrationModule { }
