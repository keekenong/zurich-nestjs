import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { DatabaseModule } from '../database/database.module';
import { LoggerModule } from '../utils/logger.module';
import { CustomLogger } from '../utils/logger';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([ProductEntity]),
    LoggerModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, CustomLogger],
  exports: [ProductService],
})
export class ProductModule {}
