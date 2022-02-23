import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { environment } from '../environments';
import { TranslationService } from './services';

@Module({
  controllers: [],

  imports: [
    ConfigModule,
    HttpModule
  ],

  providers: [
    ConfigService,
    TranslationService
  ],
})

export class TranslationModule { }
