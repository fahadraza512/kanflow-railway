import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        // Support Railway's REDIS_URL or individual connection params
        const redisUrl = configService.get('REDIS_URL');
        
        if (redisUrl) {
          // Use REDIS_URL for Railway/Heroku style deployment
          return new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: false,
          });
        }
        
        // Fallback to individual connection params for local development
        return new Redis({
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD') || undefined,
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: false,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
