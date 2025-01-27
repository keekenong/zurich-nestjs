import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './products/product.module';
import { ProductController } from './products/product.controller';
import configuration from './config/configuration';
import { ApiKeyMiddleware } from './common/middleware/apiKey.middleware';
import { LoggerModule } from './utils/logger.module';
import { DatabaseModule } from './database/database.module';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { CustomLogger } from './utils/logger';

@Module({
  imports: [
    CacheModule.register<CacheModuleOptions>({
      isGlobal: true,
      ttl: 200,
      max: 100,
    }),
    ProductModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule,
    DatabaseModule,
  ],
  providers: [CustomLogger],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes(ProductController);
  }
}
