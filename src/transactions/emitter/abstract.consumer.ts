import { EVENT_HANDLER_METADATA } from '../decorators/event-handler.decorator';
import { NestEventEmitter } from '@pe/nest-kit';

export abstract class AbstractConsumer {
  protected handlers;
  protected emitter: NestEventEmitter;

  constructor() {
    this.handlers = Reflect.getMetadata(
      EVENT_HANDLER_METADATA,
      new.target.prototype,
    );
  }

  public registerHandlers(): void {
    for (const handler of this.handlers) {
      this.emitter.on(
        handler.event,
        async(...parameters) => this[handler.handler](...parameters),
      );
    }
  };
}
