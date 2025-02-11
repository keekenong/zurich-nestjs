import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ProductEntity } from './products/entities/product.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [ProductEntity],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  migrationsTableName: '_migrations',
  synchronize: false,
});
