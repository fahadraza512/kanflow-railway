import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { Preference } from '../preferences/entities/preference.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { User } from '../auth/entities/user.entity';
import { EmailModule } from '../email/email.module';
import { EventsGateway } from './gateways/events.gateway';
import { RealtimeEventsService } from './services/realtime-events.service';
import { SseAuthGuard } from './guards/sse-auth.guard';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Notification, Preference, Workspace, User]),
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'default-secret',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService, 
    EventsGateway, 
    RealtimeEventsService,
    SseAuthGuard,
  ],
  exports: [NotificationsService, EventsGateway, RealtimeEventsService],
})
export class NotificationsModule {}
