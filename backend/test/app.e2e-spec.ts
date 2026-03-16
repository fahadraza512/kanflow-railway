import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from './../src/common/interceptors/response.interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply same configuration as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.setGlobalPrefix('api/v1');
    
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBe('Hello World!');
        expect(res.body.success).toBe(true);
      });
  });
});
