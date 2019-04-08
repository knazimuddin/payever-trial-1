import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';

export abstract class BaseFixture {
  constructor(
    protected readonly connection: Connection,
    protected readonly application: INestApplication,
  ) {}

  public abstract async apply(): Promise<void>;
}
