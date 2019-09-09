import { AbstractConsumer } from './abstract.consumer';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class EmitterConsumerInitializer {
  private readonly consumers: AbstractConsumer[] = [];

  public addConsumer(emitterConsumer: AbstractConsumer): void {
    this.consumers.push(emitterConsumer);
  }

  public init(): void {
    this.consumers.forEach((emitterConsumer: AbstractConsumer) => emitterConsumer.registerHandlers());
  }
}
