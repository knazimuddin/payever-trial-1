import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MongooseSchemas } from './config';
import { IntegrationController } from './controllers';
import { IntegrationService } from './services';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature(MongooseSchemas),
  ],
  exports: [
    IntegrationService,
  ],
  controllers: [
    IntegrationController,
  ],
  providers: [
    IntegrationService,
  ],
})
export class IntegrationModule { }
