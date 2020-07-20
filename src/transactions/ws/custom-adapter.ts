import { INestApplicationContext, Injectable, Logger } from '@nestjs/common';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { WsAdapter } from '@nestjs/platform-ws';
import { Server } from 'http';

let wsPackage: any = { };

@Injectable()
export class CustomWsAdapter extends WsAdapter {
  constructor(
    protected readonly port: number = 0,
    protected readonly appOrHttpServer: INestApplicationContext | Server,
    protected readonly logger: Logger,
  ) {
    super(appOrHttpServer);
    wsPackage = loadPackage('ws', 'WsAdapter');
  }

  public create(
    customPort: number,
    options?: any,
  ): any {
    this.logger.log(`WebSocket Server created at port [${this.port}]`, 'CustomWsAdapter');

    const port: number = customPort === 0
      ? this.port
      : customPort
    ;
    const { server, ...wsOptions }: any = options;

    if (port === 0 && this.httpServer) {
      return this.bindErrorHandler(
        new wsPackage.Server({
          server: this.httpServer,
          ...wsOptions,
        }),
      );
    }

    return server
      ? server
      : this.bindErrorHandler(
        new wsPackage.Server({
          port,
          ...wsOptions,
        }),
      );
  }
}
