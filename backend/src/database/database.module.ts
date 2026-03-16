import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const isProd = configService.get('NODE_ENV') === 'production';

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: isProd ? { rejectUnauthorized: false } : false,
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: !isProd,
            logging: !isProd,
          };
        }

        return {
          type: 'postgres',
          host: configService.get('DATABASE_HOST'),
          port: configService.get<number>('DATABASE_PORT'),
          username: configService.get('DATABASE_USER'),
          password: configService.get('DATABASE_PASSWORD'),
          database: configService.get('DATABASE_NAME'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: !isProd,
          logging: !isProd,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
