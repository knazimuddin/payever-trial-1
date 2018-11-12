import { HttpModule, Module } from '@nestjs/common';
import { StatusHttpController } from './controllers/status-http.controller';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [
    StatusHttpController,
  ],
  providers: [
  ],
})
export class StatusModule {}
