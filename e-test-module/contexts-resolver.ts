import { Type } from '@nestjs/common';
import { ContextInterface } from './context.interface';

export class ContextsResolver {
  public static resolve( contexts: Array<Type<ContextInterface>>) {
    contexts.forEach(name => {
      const context = new name();
      context.resolve();
    });
  }
}
