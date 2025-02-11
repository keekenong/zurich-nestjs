import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrationsRun: false,
        migrationsTableName: '_migrations',
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        synchronize: false,
        logging: false,
        maxQueryExecutionTime: 1000, // Log queries taking longer than 1 second
        extra: {
          max: 10,
          idleTimeoutMillis: 30000,
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
