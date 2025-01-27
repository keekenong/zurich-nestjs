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
        migrationsRun: true,
        migrationsTableName: '_migrations',
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        cli: {
          migrationsDir: 'src/migrations',
        },
        synchronize: false,
        logging: false, // Enable logging
        maxQueryExecutionTime: 1000, // Log queries taking longer than 1 second
        extra: {
          connectionLimit: 10, // Use connection pooling
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
