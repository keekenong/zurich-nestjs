import * as dotenv from 'dotenv';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { DataSource, QueryRunner } from 'typeorm';

dotenv.config({ path: '../.env.test' });

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let cacheManager: Cache;
  let queryRunner: QueryRunner;
  let adminApiKey: string;
  let userApiKey: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [ConfigService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    userApiKey =
      'nt4tNAZCWEB119f6SjouR66K5MUnOcEWUQFu4tosVBOhxp4bNzGyEaF7p31dHLOBXcCBWyYhV53GeZW0lm7ZTLUMh91sdc5cxszDCa6Mqn6v8EFi5eNAR15a1T5duIhO';
    adminApiKey =
      'Dpvg3ZmkHKNyFrilaa0iWWGOtJiamaK6Xze1ZsSrm0fHZSzdsBilhBmOAiTVQFWX5jHe3HlR2S6MyZfu2DpzpfmJcLmYx9SfwRWCweQzCoh9kySxwI6RBosS3CajW4yL';
    cacheManager = moduleFixture.get<Cache>(CACHE_MANAGER);
    const dataSource = moduleFixture.get<DataSource>(DataSource);
    queryRunner = dataSource.createQueryRunner();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    // Start a new transaction before each test
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    // Rollback the transaction after each test
    await queryRunner.rollbackTransaction();
  });

  afterAll(async () => {
    // Release the query runner
    await queryRunner.release();
    await app.close();
  });

  describe('/products (GET)', () => {
    it('should return a list of products from cache', async () => {
      const cachedProducts = [
        {
          id: 1,
          productCode: '1000',
          productDescription: 'Product 1',
          location: 'West Malaysia',
          price: 100,
        },
      ];
      await cacheManager.set('product_1000_West Malaysia', cachedProducts, 300);

      const response = await request(app.getHttpServer())
        .get('/products')
        .query({ productCode: '1000', location: 'West Malaysia' })
        .set('x-api-key', adminApiKey)
        .set('x-role', 'admin')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.data).toEqual(cachedProducts);
    });

    it('should return a list of products from database and cache it', async () => {
      await cacheManager.del('product_2000_West Malaysia'); // Ensure cache is empty

      const response = await request(app.getHttpServer())
        .get('/products')
        .query({ productCode: '2000', location: 'West Malaysia' })
        .set('x-api-key', adminApiKey)
        .set('x-role', 'admin')
        .expect(200);
      expect(response.body.status).toBe('OK');
      expect(Array.isArray(response.body.data)).toBe(true);

      const cachedProducts = await cacheManager.get(
        'product_2000_West Malaysia',
      );
      expect(cachedProducts).toEqual(response.body.data);
    });

    it('should return 401 if no API key is provided', async () => {
      await request(app.getHttpServer()).get('/products').expect(401);
    });
  });

  describe('/products (POST)', () => {
    it('should create a new product and return the list of products', async () => {
      const createProductDto = {
        productCode: '3000',
        productDescription: 'Product 1',
        location: 'West Malaysia',
        price: 100,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .set('x-api-key', adminApiKey)
        .set('x-role', 'admin')
        .send(createProductDto)
        .expect(201);

      expect(response.body.status).toBe('OK');
      expect(response.body.data[0].productCode).toBe(
        { ...createProductDto, productCode: 3000 }.productCode,
      );
    });

    it('should return 400 if validation fails', async () => {
      const createProductDto = {
        productCode: '1000',
        location: 'West Malaysia',
        price: 'ok',
      };

      await request(app.getHttpServer())
        .post('/products')
        .set('x-api-key', adminApiKey)
        .set('x-role', 'admin')
        .send(createProductDto)
        .expect(400);
    });
  });

  describe('/products?productCode (PUT)', () => {
    it('should update a product and return the list of products', async () => {
      const updateProductDto = {
        location: 'West Malaysia',
        price: 150,
      };

      const response = await request(app.getHttpServer())
        .put('/products?productCode=3000')
        .set('x-api-key', adminApiKey)
        .set('x-role', 'admin')
        .send(updateProductDto)
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.data).toEqual(
        expect.arrayContaining([expect.objectContaining(updateProductDto)]),
      );
    });

    it('should return 400 if validation fails', async () => {
      const updateProductDto = {
        location: 123,
      };

      await request(app.getHttpServer())
        .put('/products?productCode=1000')
        .set('x-api-key', adminApiKey)
        .set('x-role', 'admin')
        .send(updateProductDto)
        .expect(400);
    });
  });

  describe('/products?productCode (DELETE)', () => {
    it('should delete a product and return the list of products', async () => {
      const response = await request(app.getHttpServer())
        .delete('/products?productCode=5000')
        .set('x-api-key', adminApiKey)
        .set('x-role', 'admin')
        .expect(200);

      expect(response.body.status).toBe('OK');
    });

    it('should return 401 if no API key is provided', async () => {
      await request(app.getHttpServer())
        .delete('/products?productCode=1000')
        .expect(401);
    });
  });
});
