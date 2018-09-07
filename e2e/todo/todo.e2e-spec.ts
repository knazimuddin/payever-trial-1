import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AuthGuard } from '../../src/common';
import { TodoModule } from '../../src/todo/todo.module';
import { TodoService } from '../../src/todo/todo.service';

describe('Todo', () => {
  let app: INestApplication;

  const testBusinessUuid = 'test_business_uuid';
  const testTodoUuid = 'test_todo_uuid';

  const todoService = {
    findAll: () => ['test'],
    create: () => ['test'],
    deleteByUuidList: () => null,
    findByUuid: () => ['test'],
    updateByUuid: () => ['test'],
  };

  const authGuard = {
    canActivate: () => true,
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TodoModule],
    })
      .overrideProvider(TodoService)
      .useValue(todoService)
      .overrideProvider('TodoSchemaModel')
      .useValue({})
      .overrideGuard(AuthGuard)
      .useValue(authGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  it(`/GET todos/${testBusinessUuid}`, () => {
    return request(app.getHttpServer())
      .get(`/todos/${testBusinessUuid}`)
      .expect(200)
      .expect(todoService.findAll());
  });

  it(`/POST todos/${testBusinessUuid}`, () => {
    return request(app.getHttpServer())
      .post(`/todos/${testBusinessUuid}`)
      .expect(201)
      .expect(todoService.create());
  });

  it(`/DELETE todos/${testBusinessUuid}`, () => {
    return request(app.getHttpServer())
      .delete(`/todos/${testBusinessUuid}`)
      .expect(204);
  });

  it(`/GET todos/${testBusinessUuid}/${testTodoUuid}`, () => {
    return request(app.getHttpServer())
      .get(`/todos/${testBusinessUuid}/${testTodoUuid}`)
      .expect(200)
      .expect(todoService.findByUuid());
  });

  it(`/PATCH todos/${testBusinessUuid}/${testTodoUuid}`, () => {
    return request(app.getHttpServer())
      .patch(`/todos/${testBusinessUuid}/${testTodoUuid}`)
      .expect(200)
      .expect(todoService.updateByUuid());
  });

  afterAll(async () => {
    await app.close();
  });

});
